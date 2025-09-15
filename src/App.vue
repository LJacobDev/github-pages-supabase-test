<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import { createClient } from "@supabase/supabase-js";
import { ref, onMounted } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const error = ref(null);
const items = ref([]);
const prompt = ref('');
const geminiResponse = ref('');
const isLoading = ref(false);
const user = ref(null);
const email = ref("");
const password = ref("");
const authError = ref("");

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

const invokeGeminiProxy = async () => {
  if (!prompt.value) {
    geminiResponse.value = 'Please enter a prompt.';
    return;
  }

  isLoading.value = true;
  geminiResponse.value = '';
  error.value = null;

  try {
    const { data, error: functionError } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt: prompt.value },
    });

    console.log('Supabase function response data:', data);
    if (functionError) {
      console.error('Supabase function error:', functionError);
      throw functionError;
    }

    // The response from invoke is { data, error }, where `data` is the body.
    // The body itself is the object { generatedText: "..." }.
    geminiResponse.value = data.generatedText || 'The function responded, but the reply format was unexpected. Check the console.';
  } catch (err) {
    error.value = `Error invoking function: ${err.message}`;
    console.error('Caught error invoking function:', err);
  } finally {
    isLoading.value = false;
  }
};

const checkUser = async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
};

const login = async () => {
  authError.value = "";
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    authError.value = error.message;
  } else {
    await checkUser();
  }
};

const logout = async () => {
  await supabase.auth.signOut();
  user.value = null;
};

onMounted(async () => {
  fetchItems();
  await checkUser();
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null;
  });
});
</script>

<template>
  <div>
    <h1>Testing Database Retrieval via GitHub Pages Frontend</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else>
      <li v-for="item in items" :key="item.id">
        <strong>Created At:</strong> {{ item.created_at }}<br />
        <strong>Details:</strong> {{ item.details }}
      </li>
    </ul>

    <hr>

    <div v-if="!user">
      <h2>Login to use Gemini</h2>
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
      <div v-if="authError" class="error">{{ authError }}</div>
    </div>
    <div v-else>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span>Signed in as: <strong>{{ user.email }}</strong></span>
        <button @click="logout">Logout</button>
      </div>
      <h2>Test Gemini Edge Function</h2>
      <textarea v-model="prompt" placeholder="Enter your prompt for Gemini" rows="4" cols="50"></textarea>
      <br>
      <button @click="invokeGeminiProxy" :disabled="isLoading">
        {{ isLoading ? 'Thinking...' : 'Ask Gemini' }}
      </button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="geminiResponse">
        <h3>Gemini's Response:</h3>
        <pre>{{ geminiResponse }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
  font-weight: bold;
}

hr {
  margin: 2rem 0;
}

textarea {
  width: 100%;
  margin-bottom: 1rem;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #4a5568;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
}

input[type="email"], input[type="password"] {
  margin: 0.5rem 0.5rem 0.5rem 0;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #4a5568;
  background: #23272f;
  color: #e2e8f0;
}
button {
  background: #23272f;
  color: #e2e8f0;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}
button:hover {
  background: #4a5568;
}
</style>
