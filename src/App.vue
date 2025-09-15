<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import { createClient } from "@supabase/supabase-js";
import { ref, onMounted } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const error = ref(null);
const items = ref([]);

const fetchItems = async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from("test-table")
      .select("*");

    if (fetchError) {
      throw fetchError;
    }

    console.log("Fetched items:", data); // Debugging: Log fetched data
    items.value = data;
  } catch (err) {
    error.value = err.message;
  }
};

onMounted(() => { 
  fetchItems();
});
</script>

<template>
  <div>
    <h2>Testing Database Retrieval via GitHub Pages Frontend</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else>
      <li v-for="item in items" :key="item.id">
        <strong>Created At:</strong> {{ item.created_at }}<br />
        <strong>Details:</strong> {{ item.details }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.error {
  color: red;
  font-weight: bold;
}
/* Add any custom styles here */
</style>
