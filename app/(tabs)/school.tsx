import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import AnimatedBackground from "@/components/AnimatedBackground";
import { SafeAreaView } from "react-native-safe-area-context";

const SchoolScreen = () => {
  const { id, title, subjects, numOfYears } = useLocalSearchParams();
  const parsedSubjects: string[] = subjects ? JSON.parse(subjects as string) : [];

  const dynamicMarginB = 110 - parsedSubjects.length * 2;
  const dynamicMarginT = parsedSubjects.length * 3;

  return (
    <AnimatedBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={parsedSubjects}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 10 }}>
              <Text
                style={[styles.naslov, { marginBottom: dynamicMarginB, marginTop: dynamicMarginT, }]}>{title}</Text>

              <Text style={styles.subHeading}>Predmeti:</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.subjectBox} onPress={() => {/*console.log(id + " " + numOfYears + " " + item);*/ 
                router.push({pathname: "/SubjectScreen", params: { schoolID: id, numOfYears, subject: item }})}}>
              <Text style={styles.subjectText}>{item}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <Text style={[styles.infoText, { paddingHorizontal: 10, marginTop: 3}]}>Število letnikov: {numOfYears}</Text>
          }
          contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 10 }}
        />
      </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    marginTop: 5,
  },
  subjectBox: {
    backgroundColor: "#007BFF20",
    borderColor: "#007BFF",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 4,
  },
  subjectText: {
    color: "#fff",
    fontSize: 18,
  },
  naslov: {
    color: "#0070BB",
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SchoolScreen;
