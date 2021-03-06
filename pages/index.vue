<template>
  <div
    v-touch:swipe.left="swipeLeft"
    v-touch:swipe.right="swipeRight"
    class="w-screen h-screen flex flex-col items-center"
  >
    <section
      v-if="$auth.loggedIn"
      class="flex flex-col mt-12 justify-between fixed h-8 w-screen max-w-md bg-grey1 shadow-lg"
    >
      <div class="flex justify-around h-full w-screen max-w-md">
        <button class="text-white font-light w-full" @click="setActive('feed')">
          Feed
        </button>
        <button
          class="text-white font-light w-full"
          @click="setActive('groups')"
        >
          Gruppen
        </button>
        <button
          class="text-white font-light w-full"
          :class="{ active: isActive('all') }"
          @click="setActive('all')"
        >
          Alles
        </button>
      </div>

      <div
        class="block bg-white h-px slider w-1/3 right-0 "
        :style="{ marginLeft: sliderMargin }"
      />
    </section>
    <section
      v-if="noposts"
      class="text-white text-xl text-center h-screen w-screen center-items flex-col px-2"
    >
      <h3>Willkommen bei Tschau.app</h3>
      <p class="text-sm opacity-75 pt-3">
        Drücke unten auf das Plus, um einen neuen Post oder eine neue Gruppe zu
        erstellen.
      </p>
      <p class="text-sm opacity-75 pt-3">
        Drücke oben links auf das Icon, um dein Profil zu sehen und zu
        bearbeiten.
      </p>
    </section>
    <section
      v-else
      v-infinite-scroll="loadMore"
      class="w-screen flex flex-col items-center pb-16 pt-24"
      infinite-scroll-disabled="autoLoadDisabled"
      infinite-scroll-distance="20"
    >
      <section
        v-if="$auth.loggedIn && isActive('groups')"
        class="flex items-center justify-around w-full max-w-md"
      >
        <h2 v-if="groupName" class="text-white font-light text-lg pb-4">
          @{{ groupName }}
        </h2>
        <baseButton @clicked="show = true">
          andere Gruppe wählen
        </baseButton>
      </section>
      <groupSearch v-if="show" @close="setGroup($event)" />
      <postComponent v-for="(post, i) in posts" :key="i" :post="post" />
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import groupSearch from '@/components/groupSearch.vue'
import postComponent from '@/components/postComponent.vue'
export default {
  components: {
    postComponent,
    groupSearch
  },
  data() {
    return {
      page: 1,
      loading: false,
      group: 1,
      show: false,
      activeTab: 'feed'
    }
  },
  computed: {
    autoLoadDisabled() {
      return this.loading || this.finish
      // || this.posts.length === 0
    },
    groupName() {
      if (this.posts[0]) return this.posts[0].group_name
      else return ''
    },
    finish() {
      return !this.start && !this.next
    },
    sliderMargin() {
      if (this.isActive('feed')) return '0%'
      else if (this.isActive('groups')) return '33%'
      else return '66%'
    },
    noposts() {
      if (this.posts.length <= 0 && this.gotposts) return true
      else return false
    },
    ...mapState({
      posts: (state) => state.posts.posts,
      next: (state) => state.posts.next,
      start: (state) => state.posts.start,
      gotposts: (state) => state.posts.gotposts
    })
  },

  methods: {
    setGroup(group) {
      this.show = false
      if (group) {
        this.group = group.id
        this.$store.dispatch('posts/deletePosts').then(this.loadMore())
      }
    },

    isActive(menuTab) {
      return this.activeTab === menuTab
    },
    setActive(menuTab) {
      this.activeTab = menuTab
      this.$store.dispatch('posts/deletePosts').then(this.loadMore())
    },
    swipeRight() {
      if (this.isActive('groups')) this.setActive('feed')
      else if (this.isActive('all')) this.setActive('groups')
    },
    swipeLeft() {
      if (this.isActive('groups')) this.setActive('all')
      else if (this.isActive('feed')) this.setActive('groups')
    },
    showFeed() {
      this.feed = !this.feed
      this.$store.dispatch('posts/deletePosts').then(this.loadMore())
    },
    loadMore($state) {
      this.loading = true
      if (!this.$auth.loggedIn || this.isActive('all')) {
        this.$store
          .dispatch('posts/publicPosts')
          .then((this.loading = false))
          .catch((e) => {
            this.error({
              statusCode: 503,
              message: 'Unable to get posts'
            })
          })
      } else if (this.isActive('groups')) {
        this.$store
          .dispatch('posts/fetchPosts', {
            group: this.group,
            user: this.$auth.user.pk
          })
          .then((this.loading = false))
          .catch((e) => {
            this.error({
              statusCode: 503,
              message: 'Unable to get posts'
            })
          })
      } else if (this.isActive('feed')) {
        this.$store
          .dispatch('posts/fetchFeed', this.$auth.user.pk)
          .then((this.loading = false))
          .catch((e) => {
            this.error({
              statusCode: 503,
              message: 'Unable to get posts'
            })
          })
      }
    }
  },
  head() {
    return {
      title: 'Das beste und sicherste Soziale Netzwerk',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content:
            'Tschau! Auf der Suche nach einem sicheren Sozialen Netzwerk, wo du Gruppen erstellen und tolle Bilder teilen kannst? Dann bist du hier genau richtig!'
        }
      ]
    }
  }
}
</script>

<style scoped>
.slider {
  transition: margin-left 0.2s ease-in-out;
}
</style>
