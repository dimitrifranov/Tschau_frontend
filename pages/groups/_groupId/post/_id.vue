<template>
  <div class="flex flex-col items-center h-screen pt-16">
    <postComponent :post="post" />
    <comments :comments="comments" :post="post.id" class="pb-16" />
  </div>
</template>

<script>
import postComponent from '@/components/postComponent.vue'
import comments from '@/components/comments.vue'

export default {
  components: {
    postComponent,
    comments
  },
  async asyncData({ $axios, route, error, $auth }) {
    let post = null
    if ($auth.loggedIn) {
      post = await $axios.get(
        'groups/' + route.params.groupId + '/posts/' + route.params.id + '/',
        { params: { user: $auth.user.pk } }
      )
    } else {
      post = await $axios.get(
        'groups/' + route.params.groupId + '/posts/' + route.params.id + '/'
      )
    }
    const comments = await $axios.get(
      'groups/' +
        route.params.groupId +
        '/posts/' +
        route.params.id +
        '/comments/'
    )

    return {
      post: post.data,
      comments: comments.data.results
    }
  },
  data() {
    return {
      comment: '',
      comment_label: 'Kommentieren'
    }
  },
  head() {
    return {
      title: this.post.title,
      meta: [
        // {
        //   property: 'og:title',
        //   content: this.post.title + ' | Tschau'
        // },
        // {
        //   property: 'og:url',
        //   content: this.$config.baseUrl + this.$route.path
        // },
        {
          hid: 'description',
          name: 'description',
          content: 'Einer von vielen Posts'
        }
      ]
    }
  }
}
</script>

<style scoped></style>
