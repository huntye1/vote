import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../components/Index.vue'
import Create from '../components/Create.vue'
import MyVotes from '../components/MyVotes.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Vote from '../components/Vote.vue'
import Participation from "../components/Participation.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    redirect: "/index"
  },
  {
    path: "/index",
    component: Index,
    redirect: "/index/myvotes",
    children: [
      {
        path: "create",
        component: Create
      },
      {
        path: "myvotes",
        component: MyVotes
      },
      {
        path: "myparticipation",
        component: Participation
      }
    ]
  }, {
    path: "/login",
    component: Login,
  }, {
    path: "/register",
    component: Register,
  }, {
    path: "/create",
    component: Create,
  }, {
    path: "/vote/:id",
    component: Vote
  }
]


const router = new VueRouter({
  routes
})

export default router
