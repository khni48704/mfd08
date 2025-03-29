<!-- HomeView.vue -->
<template>
  <div class="home-container">
    <h1>Velkommen til hjemmesiden</h1>
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '../components/LoginForm.vue';
</script>

<style scoped>
.home-container {
  text-align: center;
}
</style>
