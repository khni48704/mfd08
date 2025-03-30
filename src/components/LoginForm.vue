<script setup>
import { ref } from "vue";
import { auth, db } from "@/configs/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert("Indtast venligst email og adgangskode");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // Hent brugerens data
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      console.log("Brugerdata:", userDoc.data());
    } else {
      console.error("Brugerdokument ikke fundet!");
    }

    alert("Login succesfuld!");
    router.push("/LandingPage");
  } catch (error) {
    console.error("Fejl ved login:", error);
    alert("Fejl: " + error.message);
  }
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<template>
  <div class="auth-container">
    <h2>Log ind</h2>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="input-group">
        <label for="password">Adgangskode:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit" class="btn">Log ind</button>
      <p @click="goToRegister" class="toggle-text">Har du ikke en konto? Opret en her.</p>
    </form>
  </div>
</template>

<style scoped>

.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 25px;
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  color: white;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}

input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  outline: none;
  transition: all 0.3s ease;
}

input:focus {
  background-color: rgba(255, 255, 255, 0.4);
}

.btn {
  width: 100%;
  padding: 12px;
  background-color: #ff6b6b;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn:hover {
  background-color: #ff4757;
}

.toggle-text {
  margin-top: 15px;
  cursor: pointer;
  font-size: 14px;
  color: #f8f8f8;
}

.toggle-text:hover {
  text-decoration: underline;
}
</style>
