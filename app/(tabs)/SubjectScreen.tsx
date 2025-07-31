import AnimatedBackground from "@/components/AnimatedBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, getDoc, query, where, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { FlatList, StyleSheet, Text, Image, View, TouchableOpacity, Dimensions, Modal, ActivityIndicator, Animated, } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";


interface Params {
  schoolID: string;
  numOfYears: string;
  subject: string;
}

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

interface ImageItem {
  url: string;
  keywords: string[];
  prof: string;
}

const SubjectScreen = () => {
  const params = useLocalSearchParams();
  const schoolID = params.schoolID as string;
  const numOfYears = params.numOfYears as string;
  const subject = params.subject as string;

  const yearsCount = parseInt(numOfYears, 10);
  const yearOptions = Array.from({ length: yearsCount }, (_, i) => i + 1);

  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
  const [groupedImages, setGroupedImages] = useState<{ year: string; images: ImageItem[] }[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<ImageItem[]>([]);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulseHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
  if (!schoolID || !subject) return;

  const fetchTestsAndLikes = async () => {
    setLoading(true);

    const q = query(
      collection(db, "tests"),
      where("schoolID", "==", schoolID),
      where("predmet", "==", subject),
      where("letnik", "==", selectedYear)
    );

    const snapshot = await getDocs(q);
    const groupedByYear: { [year: string]: ImageItem[] } = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const year = data.year;
      const slike: string[] = data.slike;
      const keywords: string[] = data.keywords || [];
      const prof: string = data.prof || "";

      if (!year || !slike) return;

      if (!groupedByYear[year]) {
        groupedByYear[year] = [];
      }

      const imageItems: ImageItem[] = slike.map((url) => ({ url, keywords, prof, }));
      groupedByYear[year].push(...imageItems);
    });

    const sorted = Object.entries(groupedByYear)
      .sort((a, b) => {
        const aYear = parseInt(a[0].split("/")[0]);
        const bYear = parseInt(b[0].split("/")[0]);
        return bYear - aYear;
      })
      .map(([year, images]) => ({ year, images }));

    setGroupedImages(sorted);

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const saved = userData.saved || [];
        setLikedImages(new Set(saved));
      } else {
        console.log("No user doc found");
      }
    } else {
      console.log("No user signed in");
      setLikedImages(new Set());
    }

    setLoading(false);
  };

  fetchTestsAndLikes();
}, [schoolID, subject, selectedYear]);


  const cycleYear = () => {
    const currentIndex = yearOptions.indexOf(selectedYear);
    const nextIndex = (currentIndex + 1) % yearOptions.length;
    setSelectedYear(yearOptions[nextIndex]);
  };


  const openModal = (images: ImageItem[], index: number) => {
    setCurrentImages(images);
    setModalImageIndex(index);
    setIsModalVisible(true);
  };


  const toggleLike = async (url: string) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log("No user is signed in");
    return;
  }

  setLikedImages((prev) => {
    const newSet = new Set(prev);

    if (newSet.has(url)) {
      //Remove from local state
      newSet.delete(url);
      console.log("Unliked");

      //Remove from Firestore
      updateDoc(doc(db, "users", user.uid), {
        saved: arrayRemove(url),
      }).catch((error) => {
        console.error("Error removing from saved:", error);
      });

    } else {
      //Add to local state
      newSet.add(url);
      pulseHeart();

      //Add to Firestore
      updateDoc(doc(db, "users", user.uid), {
        saved: arrayUnion(url),
      }).catch((error) => {
        console.error("Error adding to saved:", error);
      });

      console.log("Liked");
    }

    return newSet;
  });
};


  return (
    <AnimatedBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.heading}>{subject}</Text>
        <View style={styles.header}>

  <TouchableOpacity
    onPress={() => {router.push({ pathname: "/(tabs)/objavi", params: { schoolID: schoolID, subject: subject}});}} style={styles.uploadButton}>
    <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity onPress={cycleYear} style={styles.yearButton}>
    <Text style={styles.yearButtonText}>Letnik: {selectedYear}</Text>
  </TouchableOpacity>

  
</View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0070BB"
            style={{ marginTop: 50 }}
          />
        ) : groupedImages.length === 0 ? (
          <Text style={styles.noTests}>Ni testov</Text>
        ) : (
          <FlatList
            data={groupedImages}
            keyExtractor={(item) => item.year}
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ height: screenHeight, justifyContent: "center" }}>
                <Text style={styles.yearLabel}>{item.year}</Text>

                <FlatList
                  data={item.images}
                  horizontal
                  pagingEnabled
                  snapToAlignment="center"
                  decelerationRate="fast"
                  snapToInterval={screenWidth}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => String(i)}
                  renderItem={({ item: imageItem, index }) => (
                    <View style={styles.imageContainer}>
                      <Text style={styles.keywords}>
                        {imageItem.keywords.join(", ")}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openModal(item.images, index)}
                      >
                        <Image
                          source={{ uri: imageItem.url }}
                          style={styles.image}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <Text style={styles.prof}>Prof: {imageItem.prof}</Text>
                      <TouchableOpacity
                        onPress={() => toggleLike(imageItem.url)}
                        style={styles.likeButton}
                      >
                        <Animated.View
                          style={{ transform: [{ scale: scaleAnim }] }}
                        >
                          <Ionicons
                            name={
                              likedImages.has(imageItem.url)
                                ? "heart"
                                : "heart-outline"
                            }
                            size={34}
                            color="#0070BB"
                          />
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}
          />
        )}

        {/* Fullscreen Zoom Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={{ flex: 1 }}>
            <ImageViewer
              imageUrls={currentImages.map((img) => ({ url: img.url }))}
              index={modalImageIndex}
              onCancel={() => setIsModalVisible(false)}
              enableSwipeDown
              swipeDownThreshold={90} // try lowering this for easier close
              useNativeDriver={true}
              backgroundColor="#000"
              saveToLocalByLongPress={false}
            />

            {currentImages[modalImageIndex] && (
              <View style={styles.modalOverlay}>
                <TouchableOpacity
                  onPress={() => toggleLike(currentImages[modalImageIndex].url)}
                >
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Ionicons
                      name={
                        likedImages.has(currentImages[modalImageIndex].url)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={40}
                      color="#0070BB"
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0070BB",
    textAlign: "center",
    marginVertical: 10,
  },
  imageContainer: {
    width: screenWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.67,
    borderRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },
  yearButton: {
    backgroundColor: "#0070BB",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  yearButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  yearLabel: {
    position: "absolute",
    top: 60,
    left: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 10,
  },
  keywords: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  prof: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 4,
  },
  likeButton: {
    marginTop: 8,
  },
  modalOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  modalCounter: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  modalKeywords: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
    textAlign: "center",
  },
  modalProf: {
    color: "#fff",
    marginTop: 4,
    fontSize: 16,
    textAlign: "center",
  },
  noTests: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
  },
  uploadButton: {
    backgroundColor: "#3C2E97",
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
    color: "fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
    
},
  

});

export default SubjectScreen;
