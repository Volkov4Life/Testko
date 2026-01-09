import AnimatedBackground from "@/components/AnimatedBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, Image, View, TouchableOpacity, Dimensions, Modal, Animated, ActivityIndicator } from "react-native";
import { getAuth } from "firebase/auth";
import { collection, getDoc, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import ImageViewer from "react-native-image-zoom-viewer";
import { Ionicons } from "@expo/vector-icons";
import { getDocs } from "firebase/firestore";
import BackButton from "@/components/BackButton";

const screenWidth = Dimensions.get("window").width;

interface TestItem {
  docId: string;        
  keywords: string[];    
  prof: string;   
  images: string[];       
  letnik: number;        
  predmet: string;        
}


interface ImageItem {
  url: string;
  keywords: string[];
  prof: string;
}

export default function LikedTestsScreen() {
  const [likedTests, setLikedTests] = useState<TestItem[]>([]);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState<ImageItem[]>([]);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [currentTestItem, setCurrentTestItem] = useState<TestItem | null>(null);


  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pulseHeart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  };

 useEffect(() => {
  const fetchLikedTests = async () => {
    setLoading(true);
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
     
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) return;

      const userData = userSnap.data();
      const savedUrls: string[] = userData.saved || [];
      setLikedImages(new Set(savedUrls));

      const testsColRef = collection(db, "tests");
      const testsQuerySnapshot = await getDocs(testsColRef);

      
      const likedTestsTemp: TestItem[] = testsQuerySnapshot.docs
        .map((testDoc) => {
          const data = testDoc.data();
          const slike: string[] = data.slike || [];
          const keywords: string[] = data.keywords || [];
          const prof: string = data.prof || "";
          const letnik: number = data.letnik || 0;
          const predmet: string = data.predmet || "";

      
          if (slike.some((url) => savedUrls.includes(url))) {
            return {
              docId: testDoc.id,
              keywords,
              prof,
              images: slike,
              letnik,
              predmet,
            } as TestItem;
          } else {
            return null;
          }
        })
        .filter((test): test is TestItem => test !== null); 

      
      likedTestsTemp.sort((a, b) => {
        if (a.letnik !== b.letnik) return b.letnik - a.letnik;
        return a.predmet.localeCompare(b.predmet);
      });

      setLikedTests(likedTestsTemp);
    } catch (error) {
      console.error("Error fetching liked tests:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchLikedTests();
}, []);


  const openModal = (test: TestItem, index: number) => {
  const imageItems = test.images.map((url) => ({ url, keywords: test.keywords, prof: test.prof }));
  setCurrentImages(imageItems);
  setModalImageIndex(index);
  setCurrentTestItem(test); // <-- save the full TestItem
  setIsModalVisible(true);
};


  const toggleLike = async (test: TestItem) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const firstUrl = test.images[0]; 
    setLikedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(firstUrl)) {
        newSet.delete(firstUrl);
        
        updateDoc(doc(db, "users", user.uid), { saved: arrayRemove(...test.images) });
      } else {
        newSet.add(firstUrl);
        pulseHeart();
        updateDoc(doc(db, "users", user.uid), { saved: arrayUnion(...test.images) });
      }
      return newSet;
    });
  };

  const renderCard = ({ item }: { item: TestItem }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => openModal(item, 0)}>
  <Image
    source={{ uri: item.images[0] }}
    style={styles.cardImage}
    resizeMode="cover"
  />
</TouchableOpacity>

      <View style={styles.cardFooter}>
        <Text style={styles.keywordsText}>{item.keywords.join(", ")}</Text>
        <Text style={styles.profText}>Prof: {item.prof}</Text>
        <Text style={styles.profText}>{item.predmet}</Text>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.likeButton}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={likedImages.has(item.images[0]) ? "heart" : "heart-outline"}
              size={28}
              color="#fff"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AnimatedBackground>
      <SafeAreaView style={{ flex: 1 }}>

        <BackButton />


        <Text style={styles.heading}>Všečkani testi</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0070BB" style={{ marginTop: 50 }} />
        ) : likedTests.length === 0 ? (
          <Text style={styles.noTests}>Ni všečkanih testov</Text>
        ) : (
          <FlatList
            data={likedTests}
            keyExtractor={(item) => item.docId}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 15 }}
            renderItem={renderCard}
            contentContainerStyle={{ padding: 15 }}
          />
        )}

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
              swipeDownThreshold={90}
              useNativeDriver={true}
              backgroundColor="#000"
              saveToLocalByLongPress={false}
            />
            {currentTestItem && (
  <View style={styles.modalOverlay}>
    <TouchableOpacity onPress={() => toggleLike(currentTestItem)}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={likedImages.has(currentTestItem.images[0]) ? "heart" : "heart-outline"}
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
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0070BB",
    textAlign: "center",
    paddingVertical: 15,
    
  },
  card: {
    backgroundColor: "rgba(29,78,216,0.7)",
    borderRadius: 12,
    overflow: "hidden",
    //flex: 1,
    marginHorizontal: 5,
    width: (screenWidth - 90) / 2,
    alignSelf: "flex-start",
    
    
  },
  cardImage: {
    width: (screenWidth - 50) / 2, // 2 per row
    height: 150,
    
  },
  cardFooter: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  keywordsText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  profText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  likeButton: {
    marginTop: 6,
  },
  modalOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  noTests: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#555",
  },
});
