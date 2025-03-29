<script setup>
import { ref, onMounted } from 'vue';
import { createEntry, getEntries, updateEntry, deleteEntry } from '@/configs/firebase';
import { auth } from '@/configs/firebase';

const entries = ref([]);
const newTitle = ref('');
const newContent = ref('');
const user = ref(null);

onMounted(() => {
  auth.onAuthStateChanged((currentUser) => {
    user.value = currentUser;
    if (user.value) {
      fetchEntries();
    }
  });
});

// Hent journal entries for den nuværende bruger
const fetchEntries = async () => {
  if (user.value) {
    try {
      const fetchedEntries = await getEntries(user.value.uid); 
      if (Array.isArray(fetchedEntries)) {
        entries.value = fetchedEntries.map(entry => {
          return {
            ...entry,
            creationTime: entry.creationTime.toDate(),
            updatedTime: entry.updatedTime?.toDate() || null,
          };
        });
      } else {
        console.error("Fetched entries er ikke et array:", fetchedEntries);
      }
    } catch (error) {
      console.error("Fejl ved hentning af journal entries:", error);
    }
  } else {
    alert("Du skal være logget ind for at se dine journal entries.");
  }
};

// Opret journal entry
const handleCreate = async () => {
  if (newTitle.value && newContent.value) {
    try {
      await createEntry(newTitle.value, newContent.value);
      alert('Journal entry oprettet!');
      newTitle.value = '';
      newContent.value = '';
      await fetchEntries();
    } catch (error) {
      console.error('Fejl ved oprettelse af journal entry: ', error);
      alert('Der opstod en fejl ved oprettelsen af journal entry.');
    }
  } else {
    alert("Udfyld venligst både titel og indhold.");
  }
};

// Rediger journal entry
const handleEdit = async (id, title, content) => {
  const updatedTitle = prompt("Rediger titel:", title);
  const updatedContent = prompt("Rediger indhold:", content);
  
  if (updatedTitle !== null && updatedContent !== null) {
    await updateEntry(id, updatedTitle, updatedContent);
    alert("Journal entry opdateret!");
    await fetchEntries();
  }
};

// Slet journal entry
const handleDelete = async (id) => {
  if (confirm("Er du sikker på, at du vil slette denne journal entry?")) {
    await deleteEntry(id);
    alert("Journal entry slettet!");
    await fetchEntries();
  }
};
</script>

<template>
  <div class="landing-page">
    <h1>Landing Page - Journal Entries</h1>

    <!-- Opret Journal Entry -->
    <div class="create-entry">
      <input v-model="newTitle" placeholder="Titel" class="input-field" />
      <textarea v-model="newContent" placeholder="Indhold" class="input-field"></textarea>
      <button @click="handleCreate" class="create-button">Opret Journal Entry</button>
    </div>

    <!-- Liste af journal entries -->
    <div v-if="entries.length > 0" class="entries-list">
      <h2>Mine Journal Entries</h2>
      <ul>
        <li v-for="entry in entries" :key="entry.id" class="entry-item">
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.content }}</p>

          <!-- Kontrollér om creationTime og updatedTime er Timestamps og konverter dem -->
          <p><strong>Oprettet:</strong> 
            {{ entry.creationTime instanceof Date ? entry.creationTime.toLocaleString() : 'Invalid Date' }}
          </p>
          <p><strong>Sidst opdateret:</strong> 
            {{ entry.updatedTime instanceof Date ? entry.updatedTime.toLocaleString() : 'Ingen opdatering' }}
          </p>

          <div class="entry-actions">
            <button @click="handleEdit(entry.id, entry.title, entry.content)" class="edit-button">Rediger</button>
            <button @click="handleDelete(entry.id)" class="delete-button">Slet</button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Hvis der ikke er nogen entries -->
    <div v-else class="no-entries">
      <p>Der er endnu ingen journal entries.</p>
    </div>
  </div>
</template>

<style scoped>
/* Styling for input og textarea */
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

/* Styling for knapper */
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

/* Styling for oprettelsesfeltet */
.create-entry {
  margin-bottom: 30px;
}

/* Styling for liste af journal entries */
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

/* Styling for tilfælde, når der ikke er nogen entries */
.no-entries {
  text-align: center;
  color: #888;
  font-size: 16px;
}
</style>
