<template>
  <v-toolbar flat>
    <v-toolbar-title class="text-uppercase">Hello user</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text @click="logout">
      Logout
      <v-icon right>exit_to_app</v-icon>
    </v-btn>
  </v-toolbar>

  <Navbar />
</template>

<script>
export default {};
</script>