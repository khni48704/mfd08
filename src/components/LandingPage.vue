<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/configs/firebase";
import { doc, getDoc, getDocs, collection, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";

const userData = ref(null);
const user = ref(null);
const entries = ref([]);
const newTitle = ref("");
const newContent = ref("");

const fetchUserData = async () => {
  user.value = auth.currentUser;
  if (!user.value) {
    console.log("Ingen bruger er logget ind");
    return;
  }

  console.log("Brugerens UID:", user.value.uid);

  try {
    const userDocRef = doc(db, "users", user.value.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      userData.value = userDoc.data();
      console.log("Brugerdata hentet:", userData.value);
    } else {
      console.error("Ingen brugerdata fundet!");
    }

    fetchEntries();
  } catch (error) {
    console.error("Fejl ved hentning af brugerdata:", error);
  }
};

const fetchEntries = async () => {
  if (!user.value) return;

  try {
    console.log("Henter journal entries for UID:", user.value.uid);

    const entriesQuery = query(collection(db, "entries"), where("userId", "==", user.value.uid));
    const querySnapshot = await getDocs(entriesQuery);

    entries.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      creationTime: doc.data().creationTime?.toDate(),
      updatedTime: doc.data().updatedTime?.toDate() || null,
    }));

    console.log("Journal entries hentet:", entries.value);
  } catch (error) {
    console.error("Fejl ved hentning af entries:", error);
  }
};

const createEntry = async () => {
  if (!newTitle.value || !newContent.value || !user.value) {
    alert("Udfyld titel og indhold!");
    return;
  }

  try {
    await addDoc(collection(db, "entries"), {
      title: newTitle.value,
      content: newContent.value,
      userId: user.value.uid,
      creationTime: serverTimestamp(),
      updatedTime: null,
    });

    newTitle.value = "";
    newContent.value = "";
    fetchEntries();
  } catch (error) {
    console.error("Fejl ved oprettelse af entry:", error);
    alert("Kunne ikke oprette journal entry.");
  }
};

const editEntry = async (entry) => {
  const updatedTitle = prompt("Rediger titel:", entry.title);
  const updatedContent = prompt("Rediger indhold:", entry.content);
  if (updatedTitle === null || updatedContent === null) return;

  try {
    const entryRef = doc(db, "entries", entry.id);
    await updateDoc(entryRef, {
      title: updatedTitle,
      content: updatedContent,
      updatedTime: serverTimestamp(),
    });

    fetchEntries();
  } catch (error) {
    console.error("Fejl ved opdatering:", error);
    alert("Kunne ikke opdatere entry.");
  }
};


const deleteEntry = async (entryId) => {
  if (!confirm("Er du sikker på, at du vil slette denne entry?")) return;

  try {
    await deleteDoc(doc(db, "entries", entryId));
    fetchEntries();
  } catch (error) {
    console.error("Fejl ved sletning:", error);
    alert("Kunne ikke slette entry.");
  }
};

onMounted(fetchUserData);
</script>

<template>
  <div class="content">
    <h1>Velkommen til LandingPage</h1>
    <p v-if="userData">Du er logget ind som: {{ userData.email }}</p>
    <p v-else>Indlæser brugerdata...</p>

    <div class="create-entry">
      <h2>Opret ny Journal Entry</h2>
      <input v-model="newTitle" placeholder="Titel" class="input-field" />
      <textarea v-model="newContent" placeholder="Indhold" class="input-field"></textarea>
      <button @click="createEntry" class="create-button">Opret Journal Entry</button>
    </div>

    <div v-if="entries.length > 0" class="entries-list">
      <h2>Mine Journal Entries</h2>
      <ul>
        <li v-for="entry in entries" :key="entry.id" class="entry-item">
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.content }}</p>
          <p><strong>Oprettet:</strong> {{ entry.creationTime ? entry.creationTime.toLocaleString() : "Ukendt" }}</p>
          <p><strong>Sidst opdateret:</strong> {{ entry.updatedTime ? entry.updatedTime.toLocaleString() : "Ingen opdatering" }}</p>

          <div class="entry-actions">
            <button @click="editEntry(entry)" class="edit-button">Rediger</button>
            <button @click="deleteEntry(entry.id)" class="delete-button">Slet</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="no-entries">
      <p>Du har ingen journal entries endnu.</p>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  color: black;
}

.input-field:focus {
  border-color: #4CAF50;
  outline: none;
  background-color: #f1f1f1;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

.create-entry {
  margin-bottom: 30px;
}

.entries-list {
  margin-top: 20px;
}

.entry-item {
  background-color: #f9f9f9;
  padding: 20px;
  margin: 15px 0;
  border-radius: 6px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  color: black;
}

.entry-item h3 {
  color: black;
  margin-top: 0;
}

.entry-actions {
  margin-top: 15px;
}

.edit-button,
.delete-button {
  background-color: #ff6b6b;
  border-radius: 6px;
  color: white;
  padding: 8px;
  margin-right: 10px;
}

.edit-button:hover {
  background-color: #ff4757;
}

.delete-button:hover {
  background-color: #e74c3c;
}

.no-entries {
  text-align: center;
  color: #888;
  font-size: 16px;
}
</style>
