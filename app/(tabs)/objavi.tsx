import AnimatedBackground from "@/components/AnimatedBackground";
import * as Crypto from "expo-crypto";
import { supabase } from "@/supabaseClient";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
//import { db } from "../../firebase"; // Adjust this import to your firebase config!
import * as ImageManipulator from "expo-image-manipulator";

export default function UploadTestScreen() {
  const navigation = useNavigation();
  const { schoolID, subject } = useLocalSearchParams();

  const [keywords, setKeywords] = useState("");
  const [yearTaken, setYearTaken] = useState("");
  const [professor, setProfessor] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const compressImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1280 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  };

  const uploadImageToSupabase = async (uri: string, userId: string) => {
    try {
      console.log("Uploading image");

      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64"
,
      });

      const binaryData = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      const fileName = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.jpg`;

      const { error } = await supabase.storage
        .from("slike")
        .upload(fileName, binaryData, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading to Supabase:", error);
        return null;
      }

      const { data } = supabase.storage.from("slike").getPublicUrl(fileName);
      console.log("Uploaded image URL:", data.publicUrl);

      return data.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const generateSchoolYears = () => {
    const years: string[] = [];
    const currentYear = new Date().getFullYear() % 100;
    for (let i = 0; i < 10; i++) {
      const start = currentYear - i - 1;
      const end = start + 1;
      years.push(`${start}/${end}`);
    }
    return years;
  };

  const sanitizeKeywords = (text: string) => {
    return text
      .split(/[\s:]+/)
      .map((word) => word.replace(/[.:;,"'<>]/g, ""))
      .filter(Boolean);
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadTest = async () => {
    const auth = getAuth();
    const db = getFirestore();

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Napaka", "Uporabnik ni prijavljen.");
      return;
    }
    const cleanedKeywords = sanitizeKeywords(keywords);

    //compress in upload
    try {
      setIsUploading(true);
      const uploadedImageUrls: string[] = [];
      for (const uri of images) {
        const compressedUri = await compressImage(uri);
        const url = await uploadImageToSupabase(compressedUri, user.uid);
        if (url) uploadedImageUrls.push(url);
      }

      const testData = {
        keywords: cleanedKeywords,
        year: yearTaken,
        prof: professor,
        schoolID: schoolID,
        letnik: parseInt(yearLevel),
        predmet: subject,
        slike: uploadedImageUrls,
        owner: user.uid,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "tests"), testData);
      const allYears = 4;
      //console.log("Test uploaded with ID:", docRef.id);

      navigation.goBack();
    } catch (error) {
      console.error("Error uploading test:", error);
      Alert.alert("Napaka", "Napaka pri nalaganju testa.");
    } finally {
      setIsUploading(false);
    }
  };

  const yearOptions = generateSchoolYears();
  const yearLevels = ["1", "2", "3", "4"];



  const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert("Dostop do slik", "Testko potrebuje dovoljenje za dostop do slik.");
    return;
  }

  if (images.length >= 4) {
    Alert.alert("Omejitev", "Lahko naložiš največ 4 slike.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 1,
    base64: true,
  });

  if (!result.canceled) {
    const uniqueNewUris: string[] = [];

    for (const asset of result.assets) {
      const { uri, base64 } = asset;
      if (!base64) continue;

      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA1,
        base64.slice(0, 200) 
      );

      const existingHashes = await Promise.all(
        images.map(async (imgUri) => {
          const data = await FileSystem.readAsStringAsync(imgUri, { encoding: "base64" });
          return await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA1,
            data.slice(0, 200)
          );
        })
      );

      if (existingHashes.includes(hash)) {
        Alert.alert("Podvojena slika", "Ta slika je že dodana.");
        continue;
      }

      const fileInfo = (await FileSystem.getInfoAsync(uri)) as FileSystem.FileInfo & {
        size?: number;
      };

      //največ 12MB
      const maxSize = 12;
      
      if (fileInfo.size && fileInfo.size > maxSize * 1024 * 1024) {
        Alert.alert("Prevelika slika", "Vsaka slika mora biti manjša od " +  maxSize + " MB.");
        continue;
      }

      uniqueNewUris.push(uri);
    }

    const combined = [...images, ...uniqueNewUris].slice(0, 4);
    setImages(combined);
  }
};




  const handleSubmit = () => {
    if (
      !keywords ||
      !yearTaken ||
      !professor ||
      !yearLevel ||
      images.length === 0
    ) {
      Alert.alert(
        "Nepopolni podatki",
        "Prosimo, izpolnite vsa polja in dodajte vsaj eno sliko."
      );
      return;
    }

    uploadTest();
  };

  return (
    <AnimatedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Nazaj</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Objavi Test</Text>

          <Text style={styles.label}>Ključne besede</Text>
          <TextInput
            value={keywords}
            onChangeText={setKeywords}
            placeholder="Logaritmi funkcije..."
            placeholderTextColor="#ccc"
            maxLength={100}
            style={styles.input}
          />

          <Text style={styles.label}>Leto</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={yearTaken}
              onValueChange={(itemValue) => setYearTaken(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Izberi leto" value="" />
              {yearOptions.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Profesor</Text>
          <TextInput
            value={professor}
            onChangeText={setProfessor}
            placeholder="Ana Novak"
            placeholderTextColor="#ccc"
            style={styles.input}
            maxLength={40}
          />

          <Text style={styles.label}>Letnik</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={yearLevel}
              onValueChange={(itemValue) => setYearLevel(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Izberi letnik" value="" />
              {yearLevels.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Slike</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.uploadButtonText}>Izberi slike</Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    setImages(images.filter((_, i) => i !== index));
                  }}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Nalaganje testa...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Objavi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    marginTop: 30,
    alignSelf: "flex-start",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  card: {
    backgroundColor: "rgba(29, 78, 216, 0.7)",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
  },
  pickerWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    color: "#fff",
  },
  uploadButton: {
    backgroundColor: "#3B82F6",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    color: "#fff",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});
