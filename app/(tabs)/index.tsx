import AnimatedBackground from "@/components/AnimatedBackground";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {Alert, View, StyleSheet, Text, TextInput, TouchableOpacity} from "react-native";
import { auth, db } from "../../firebase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, setDoc } from "firebase/firestore";



export default function AuthScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confPass, setConfPass] = useState("");

  const handleLogin = async () => {
    try {

      if (isRegister && password !== confPass) {  //da je confirman password
        Alert.alert('Napaka', 'Gesli se ne ujemata.');
        return;
      }
      if (password.length < 6){
        Alert.alert("Geslo mora imeti vsaj 6 znakov!")
        return;
      }
  
      if (isRegister) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password.trim()
  );

  const user = userCredential.user;

  
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    createdAt: new Date(),
    saved: [],
    editor: 0,
    displayName: username,
  });

  console.log("Successfully registered & Firestore user created");

} else {
  await signInWithEmailAndPassword(auth, email.trim(), password.trim());
  console.log("Successful sign in");
}
      
      //redirect
      router.push("/explore");

    } catch (error: any) {
      
      if(error.message === "Firebase: Error (auth/email-already-in-use)."){  //custom error not sure kako drugac nrdit lol
        Alert.alert("Napaka: Email je že registriran")
        return;
      }else if(error.message === "Firebase: Error (auth/invalid-credential)."){  //custom error not sure kako drugac nrdit lol
        Alert.alert("Napaka: Napačen email ali geslo")
        return;
      }else if(error.message === "Firebase: Error (auth/invalid-email)."){  //custom error not sure kako drugac nrdit lol
        Alert.alert("Napaka: Neveljaven email")
        return;
      }

      Alert.alert("Napaka", error.message);
    }
  };

  return (
    <AnimatedBackground>
      
      <SafeAreaView>

        <Text style={styles.title}>
          {isRegister ? "Registracija" : "Prijava"}
        </Text>

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


        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {isRegister ? "Registracija" : "Vpis"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.switchText}>
            {isRegister ? "Že imaš račun? Prijava" : "Nimaš računa? Registracija"}
          </Text>
        </TouchableOpacity> 
        <View style={styles.shiftUp}/>     
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    
  },
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
  shiftUp: {
    marginTop: 150,
  }
  
});
