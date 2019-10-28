<template>
  <v-app>
    <v-content v-if="token">
      <!--------------------------- toolbar with Logout buton----------------------------------- -->
      <v-toolbar>
        <!-- свойство для toolbar flat убирает тень-->
        <v-app-bar-nav-icon @click="drawer =!drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-uppercase">Hello user</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text @click="logout">
          Logout
          <v-icon right>exit_to_app</v-icon>
        </v-btn>
      </v-toolbar>
      <!---------------------------left navigation bar----------------------------------- -->
      <!---------------------------часть которую стоит пересмотреть и понять что здесь----------------------------------- -->
      <v-container fluid>
        <v-layout>
          <!---------------------------left navigation bar----------------------------------- -->
          <v-navigation-drawer app v-model="drawer">
            <v-layout column align-center>
              <v-avatar color="indigo" class="mt-1" size="40">
                <v-icon dark>mdi-account-circle</v-icon>
              </v-avatar>
              <v-list-item-subtitle>{{user}}</v-list-item-subtitle>
            </v-layout>
            <v-divider></v-divider>
            <!-- permanent Ящик остается видимым независимо от размера экрана (визуально изменений нет) -->
            <v-list dense nav>
              <!-- v-list все равно что тег  ul -->
              <!-- dense - Уменьшает максимальную высоту листов списка-->
              <!-- nav - Делает края округлыми-->
              <v-list-item-group v-model="selectedLabel" color="primary">
                <!-- v-model - чтобы знать какой label выбран -->
                <v-list-item
                  @click="curentLabelId = label.name"
                  v-for="label in labels"
                  :key="label.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ label.name.toUpperCase() }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-navigation-drawer>

          <!---------------------------Table----------------------------------- -->
          <v-flex>
            <v-simple-table v-if="curentLabelId === 'INBOX'">
              <thead>
                <tr>
                  <th class="text-left">From</th>
                  <th class="text-left">Subject</th>
                  <th class="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  @click="curentMessageId = message.id"
                  v-for="message in messages"
                  :key="message.id"
                >
                  <td>{{ message.from }}</td>
                  <td>
                    <a href="javascript:void(0)">{{ message.sub }}</a>
                  </td>
                  <td>{{ message.date }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-flex>
        </v-layout>
      </v-container>
      <!---------------------------Modal window----------------------------------- -->

      <v-dialog :value="curentMessage" persistent>
        <v-card v-if="curentMessage">
          <v-toolbar flat class="headline grey lighten-2 pt-0" dense>
            <v-toolbar-title>{{curentMessage.sub}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="curentMessageId = null">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text v-html="curentMessage.text"></v-card-text>
        </v-card>
      </v-dialog>

      <!---------------------------Authorization buton----------------------------------- -->

      <!-- <pre>{{drawer}}</pre> -->
    </v-content>
    <v-content v-else>
      <div class="text-center">
        <h1>Authorization</h1>
        <br />
        <v-btn @click="login">Login</v-btn>
      </div>
    </v-content>
  </v-app>
</template>

<script>
import axios from "axios";
import {
  oauth2SignIn,
  setAuthHeader,
  getUser,
  getLables,
  getMessages
} from "./api/g_auth";

export default {
  name: "App",
  data: () => ({
    drawer: false,
    token: null,
    user: null,
    labels: [],
    messages: [],
    selectedLabel: null,
    curentMessageId: null,
    curentLabelId: null
  }),
  computed: {
    curentMessage() {
      return this.messages.find(el => el.id === this.curentMessageId);
    }
  },
  methods: {
    login() {
      oauth2SignIn();
    },
    logout() {
      this.token = null;
      setAuthHeader(null);
      localStorage.removeItem("token");
    }
  },

  mounted() {
    axios.interceptors.response.use(
      //interceptions
      resp => resp,
      err => {
        if (err.response.status === 401) {
          this.logout();
        }
        return Promise.reject(err);
      }
    );

    const hash = this.$route.hash;
    if (hash && hash.match(/^\#state/gi)) {
      this.$router.push("/" + hash.replace(/^\#/gi, "?"));
    }

    const token = this.$route.query.access_token;
    if (token) {
      setAuthHeader(token);
      localStorage.setItem("token", token);
      this.$router.replace("/");
    }

    const storageToken = localStorage.getItem("token");
    if (storageToken) {
      // method
      this.token = storageToken;

      getUser().then(response => {
        this.user = response.data.emailAddress;
      });

      getLables().then(response => {
        this.labels = response.data.labels;
      });
      getMessages().then(msgs => {
        this.messages = msgs;
      });
    }
  }
};
</script>
