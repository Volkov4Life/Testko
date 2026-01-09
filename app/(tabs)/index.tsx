import React, { useState } from "react";
import { Alert, View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";
import { router } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confPass, setConfPass] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleLogin = async () => {
    try {
      if (isRegister && password !== confPass) {
        Alert.alert('Napaka', 'Gesli se ne ujemata.');
        return;
      }
      if (password.length < 6) {
        Alert.alert("Geslo mora imeti vsaj 6 znakov!");
        return;
      }

      setLoading(true);

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
          saved: [],
          editor: 0,
          displayName: username,
        });

        await sendEmailVerification(user);

        setLoading(false); 
        Alert.alert(
          "Uspešno",
          "Registracija uspešna! Preverite svoj email za potrditev. Če niste prejeli potrditvenega linka preverite vsiljeno pošto.",
          [{ text: "OK", onPress: () => router.push("/explore") }]
        );
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        setLoading(false);
        router.push("/explore");
      }

    } catch (error: any) {
      setLoading(false); 
      if (error.message.includes("auth/email-already-in-use")) {
        Alert.alert("Napaka: Email je že registriran");
      } else if (error.message.includes("auth/invalid-credential")) {
        Alert.alert("Napaka: Napačen email ali geslo");
      } else if (error.message.includes("auth/invalid-email")) {
        Alert.alert("Napaka: Neveljaven email");
      } else {
        Alert.alert("Napaka", error.message);
      }
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Text style={styles.title}>{isRegister ? "Registracija" : "Prijava"}</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#333"
          maxLength={50}
        />

        {isRegister && (
          <TextInput
            placeholder="Uporabniško ime"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#333"
            maxLength={25}
          />
        )}

        <TextInput
          placeholder="Geslo"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#333"
          maxLength={50}
        />

        {isRegister && (
          <TextInput
            placeholder="Potrdi geslo"
            value={confPass}
            onChangeText={setConfPass}
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#333"
            maxLength={50}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isRegister ? "Registracija" : "Vpis"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.switchText}>
            {isRegister ? "Že imaš račun? Prijava" : "Nimaš računa? Registracija"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    color: "#01579b",
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#81d4fa",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#e1f5fe",
  },
  button: {
    backgroundColor: "#0288d1",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  switchText: {
    textAlign: "center",
    marginTop: 16,
    color: "#01579b",
    fontSize: 14,
  },
});
