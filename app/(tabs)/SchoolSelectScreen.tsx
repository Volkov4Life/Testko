import AnimatedBackground from "@/components/AnimatedBackground";
import Naslov from "@/components/Naslov";
import SchoolCard from "@/components/SchoolCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, FlatList, ActivityIndicator, Alert, Text, StyleSheet,} from "react-native";
import { useState, useEffect } from "react";
import {  collection,  getDocs,  query,  orderBy,  limit,  startAfter,  DocumentData,} from "firebase/firestore";
import { db } from "../../firebase";
import { router, Router } from "expo-router";
import BackButton from "@/components/BackButton";

interface School {
  id: string;
  title: string;
  numOfYears?: number;
  subjects?: string[];
}

const SchoolSelectScreen = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchSchools = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      let q;
      let naenkrat = 10;  //kok se jih naenkrat nalozi
      const schoolsRef = collection(db, "schools");

      if (lastVisible) {
        q = query(schoolsRef, orderBy("title"), startAfter(lastVisible), limit(naenkrat)); 
      } else {
        q = query(schoolsRef, orderBy("title"), limit(naenkrat));
      }

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const newSchools = snapshot.docs.map((doc) => {
        const data = doc.data() || {}; 
          return {
          id: doc.id,
          ...(data as Record<string, any>),
          };
        }) as School[];

        setSchools((prev) => [...prev, ...newSchools]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

        if (snapshot.docs.length < naenkrat) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
      Alert.alert("Napaka", "Napaka pri nalaganju.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const filteredSchools = schools.filter((school) =>
    school.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (initialLoading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (!initialLoading && schools.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 40 }}>
        Nobena šola ni bila najdena.
      </Text>
    );
  }

  return (
    <AnimatedBackground>
      <SafeAreaView style={{ flex: 1 }}>

        <BackButton/>

        <Naslov text="Izberi svojo šolo" />

        <TextInput
          placeholder="Išči šolo..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
          placeholderTextColor="#888"
        />

        <FlatList
          data={filteredSchools}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SchoolCard
              title={item.title}
              onPress={() => {
                //console.log("Selected:", item.title);
                router.push({pathname: "/school", params: { id: item.id, title: item.title, numOfYears: item.numOfYears?.toString() || "0",
                   subjects: JSON.stringify(item.subjects || [])}});
              }}
            />
          )}
          onEndReached={() => {
            if (!loading && hasMore) fetchSchools();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="small" color="#007BFF" />
            ) : null
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    margin: 16,
    marginTop: -100,
    borderColor: "#007BFF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#000",
  },
});

export default SchoolSelectScreen;
