import React, { useState } from "react";
import {  View,  Text,  TextInput,  TouchableOpacity,  StyleSheet,  ScrollView,  Image,  Alert,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
//import { db } from "../../firebase"; // Adjust this import to your firebase config!



export default function UploadTestScreen() {
  const navigation = useNavigation();
  const { schoolID, subject } = useLocalSearchParams();

  const [keywords, setKeywords] = useState("");
  const [yearTaken, setYearTaken] = useState("");
  const [professor, setProfessor] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const generateSchoolYears = () => {
    const years = [];
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
    .map(word => word.replace(/[.:;,"'<>]/g, ""))
    .filter(Boolean);
};
    const uploadTest = async () => {
  const auth = getAuth();
  const db = getFirestore();
  

  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Napaka", "Uporabnik ni prijavljen.");
    return;
  }

  const cleanedKeywords = sanitizeKeywords(keywords);

  const testData = {
    keywords: cleanedKeywords,
    year: yearTaken,
    prof: professor,
    schoolID: schoolID,
    letnik: parseInt(yearLevel),
    predmet: subject,
    owner: user.uid,
    createdAt: new Date(),
  };

  try {
    const docRef = await addDoc(collection(db, "tests"), testData);
    console.log("Test uploaded with ID: ", docRef.id);
    Alert.alert("Objavljeno", "Test je bil uspešno objavljen!");
    navigation.goBack();
  } catch (error) {
    console.error("Error uploading test:", error);
    Alert.alert("Napaka", "Napaka pri nalaganju testa.");
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...selectedUris]);
    }
  };

  const handleSubmit = () => {
  if (!keywords || !yearTaken || !professor || !yearLevel || images.length === 0) {
    Alert.alert("Nepopolni podatki", "Prosimo, izpolnite vsa polja in dodajte vsaj eno sliko.");
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

});
