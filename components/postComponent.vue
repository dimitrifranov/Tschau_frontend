<template>
  <div>
    <section class="bg-grey max-w-md pb-5">
      <div class="bg-grey-3 h-8 w-full clearfix">
        <div class="float-left h-full">
          <img
            :src="profilepicture"
            alt="icon"
            class="h-8 w-8 border border-white"
          />
        </div>
        <div class="float-left h-full flex flex-col">
          <nuxt-link :to="creator_link" class="text-white ml-3">
            {{ post.creator_name }}
          </nuxt-link>
          <nuxt-link
            :to="group_link"
            class="text-white font-light ml-3 -mt-2 text-2xs"
          >
            @{{ post.group_name }}
          </nuxt-link>
        </div>
        <div
          v-if="webShareApiSupported"
          class="float-right h-full w-8 center-items"
        >
          <share-icon fillColor="#ffffff" class="" @click="shareViaWebShare" />
        </div>
        <div class="float-right h-full w-8 center-items" @click="toggle">
          <dots-vertical-icon fillColor="#ffffff" />
        </div>
        <transition name="scale">
          <ul
            v-show="opened"
            v-click-outside="close"
            class="w-1/3 max-w-xs z-10 bg-grey3 text-white absolute right-0 flex flex-col"
          >
            <button v-if="!my_post" class="hover:underline" @click="report">
              melden
            </button>
            <button
              v-else
              class="text-error hover:underline"
              @click="delete_post"
            >
              löschen
            </button>
          </ul>
        </transition>
      </div>
      <img
        :src="post.src"
        :alt="post.title"
        class="w-screen"
        @click="$router.push(post_link)"
      />
      <div class=" h-8 w-full clearfix">
        <div class="h-full float-left center-items ml-3 text-xs">
          <h3 class="text-white">
            {{ post.title }}
          </h3>
        </div>

        <div class="h-full float-right center-items w-8">
          <p class="text-s text-white font-light">
            {{ likes }}
          </p>
        </div>
        <div
          class="h-full float-right center-items w-8 cursor-pointer"
          @click="likePost"
        >
          <chevron-up :fillColor="fillColor" :size="size" />
        </div>
        <nuxt-link :to="post_link" class="h-full float-right center-items w-8">
          <comment-outline fillColor="#ffffff" />
        </nuxt-link>
      </div>
    </section>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'
export default {
  directives: {
    ClickOutside
  },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      size: 32,
      just_liked: false,
      just_disliked: false,
      state_likes: 0,
      opened: false
    }
  },
  computed: {
    profilepicture() {
      if (this.post.profile_pic) return this.post.profile_pic
      else return '/user.png'
    },
    creator_link() {
      return '/users/' + this.post.creator
    },
    group_link() {
      return '/groups/' + this.post.group
    },
    fillColor() {
      if (this.liked) return '#0099cc'
      else return '#ffffff'
    },
    my_post() {
      if (this.$auth.loggedIn) return this.$auth.user.pk === this.post.creator
      else return false
    },
    liked() {
      if (this.just_dislikes) return false
      if (this.$auth.loggedIn) {
        if (this.post.likes.length < this.state_likes) return true
        else if (this.post.likes[0]) {
          return (
            !!this.post.likes.find(
              (like) => like.liker === this.$auth.user.pk
            ) || this.just_liked
          )
        } else return false
      } else return false
    },
    likes() {
      return this.post.likes.length > this.state_likes
        ? this.post.likes.length
        : this.state_likes
    },
    webShareApiSupported() {
      try {
        return navigator.share
      } catch (error) {
        return false
      }
    },
    post_link() {
      return '/groups/' + this.post.group + '/post/' + this.post.id
    }
  },
  methods: {
    report() {
      return null
    },
    likePost() {
      if (!this.liked && this.$auth.loggedIn) {
        this.just_disliked = false
        this.just_liked = true
        this.state_likes = this.likes
        this.state_likes++
        this.$store.dispatch('posts/likePost', {
          group: this.post.group,
          post: this.post.id,
          data: {
            liker: this.$auth.user.pk,
            post: this.post.id
          }
        })
      } else if (this.$auth.loggedIn) {
        this.just_disliked = true
        this.state_likes -= 1
        const like = this.post.likes.find(
          (obj) => obj.liker === this.$auth.user.pk
        )
        this.$store.dispatch('posts/unlikePost', {
          group: this.post.group,
          post: this.post.id,
          like: like.id
        })
      } else {
        this.$router.push('/login')
      }
    },
    toggle() {
      setTimeout(() => {
        this.opened = !this.opened
      }, 1)
    },
    close() {
      this.opened = false
    },
    shareViaWebShare() {
      try {
        navigator.share({
          title: this.post.title,
          text: '',
          url: this.$config.baseUrl + this.post_link
        })
      } catch (e) {
        this.error({
          statusCode: 500,
          message: 'Unable to share post'
        })
      }
    },
    delete_post() {
      this.$store.dispatch('posts/deletePost', {
        group: this.post.group,
        post: this.post.id
      })
    }
  }
}
</script>

<style scoped>
.scale-enter,
.scale-leave-to {
  @apply transform scale-0 origin-top-right;
}

.scale-enter-to {
  @apply transform scale-100 origin-top-right;
}

.scale-enter-active,
.scale-leave-active {
  @apply transition-transform duration-200 ease-out;
}
</style>
