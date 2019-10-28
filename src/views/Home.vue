<template>
  <div class="home">
    <div id="app">
      <v-app id="inspire">
        <div class="text-center">
          <h1>Authorization</h1>
          <br />
          <v-btn @click="trySampleRequest">Google</v-btn>
        </div>
      </v-app>
    </div>
  </div>
</template>

<script>
import { oauth2SignIn } from "../api/g_auth";

export default {
  methods: {
    trySampleRequest() {
      oauth2SignIn();
    }
  }
};
</script>