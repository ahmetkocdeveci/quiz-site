<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
});
</script>

<template>
  <RouterView />
</template>
