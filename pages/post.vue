<template>
  <div class="center-items w-screen">
    <form
      class=" w-full max-w-xs h-screen center-items flex-col pt-16 pb-16"
      @submit.prevent="postData"
    >
      <h1 class="text-white font-light mb-6">
        Neuer Beitrag:
      </h1>
      <baseInput
        v-model="title"
        value="title"
        label="Titel:"
        @blur="$v.title.$touch()"
      />
      <p
        v-if="!$v.title.required && $v.title.$error"
        class="text-xs text-error font-light -mt-4 mb-4 w-full"
      >
        Bitte Titel angeben
      </p>
      <!-- <p class="text-white text-lg">@{{ group_name }}</p>
      <baseButton @clicked="show = true">
        Gruppe wählen
      </baseButton> -->
      <section class="flex items-center justify-around w-full max-w-md">
        <nuxt-link
          :to="groupLink"
          class="text-white font-light hover:underline text-lg pb-4"
        >
          @{{ group_name }}
        </nuxt-link>
        <baseButton @clicked="show = true">
          andere Gruppe wählen
        </baseButton>
      </section>
      <groupSearch v-if="show" @close="setGroup($event)" />
      <cropper
        v-show="file"
        ref="cropper"
        class="w-full h-64"
        classname="cropper"
        :src="file"
        :stencil-props="{
          minAspectRatio: 3 / 4,
          maxAspectRatio: 16 / 9
        }"
      />
      <label
        class="cursor-pointer font-light bg-transparent hover:bg-white text-white hover:text-grey py-2 px-4 mt-2 border border-white hover:border-transparent transition-colors duration-200"
        for="file"
        >Bild hochladen</label
      >
      <input
        id="file"
        ref="file"
        name="file"
        class="inputfile"
        type="file"
        accept="image/*"
        @change="uploadImage($event)"
        @blur="$v.file.$touch()"
      />
      <p
        v-if="!$v.file.required && $v.file.$error"
        class="text-xs text-error mt-1 font-light mb-4"
      >
        Bitte Bild hinzufügen
      </p>
      <baseButton type="submit">
        Post
      </baseButton>
    </form>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import Compressor from 'compressorjs'
import groupSearch from '@/components/groupSearch.vue'
export default {
  middleware: 'auth',
  components: {
    groupSearch
  },
  mixins: [validationMixin],
  data() {
    return {
      coordinates: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      group: 1,
      group_name: 'alles',
      file: null,
      title: '',
      show: false
    }
  },
  validations: {
    title: {
      required
    },
    file: {
      required
    }
  },
  computed: {
    groupLink() {
      return '/groups/' + this.group
    }
  },
  methods: {
    setGroup(data) {
      this.show = false
      this.group = data.id
      this.group_name = data.name
    },
    crop() {
      const { coordinates, canvas } = this.$refs.cropper.getResult()
      this.coordinates = coordinates
      // You able to do different manipulations at a canvas
      // but there we just get a cropped image
      this.file = canvas.toDataURL()
    },
    uploadImage(event) {
      // Reference to the DOM input element
      const input = event.target
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        const reader = new FileReader()
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = (e) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.file = e.target.result
        }
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0])
      }
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      const byteString = atob(dataURI.split(',')[1])

      // separate out the mime component
      const mimeString = dataURI
        .split(',')[0]
        .split(':')[1]
        .split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    },
    // uploadImage(event) {
    //   this.file = event.target.files[0]
    // },
    postData() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.crop()
        const title = this.title
        const group = this.group
        const user = this.$auth.user.pk
        const router = this.$router
        const store = this.$store
        // eslint-disable-next-line no-new
        new Compressor(this.dataURItoBlob(this.file), {
          quality: 0.8,
          strict: true,
          maxWidth: 1000,
          maxHeight: 1000,
          convertSize: 0,
          success(result) {
            const formData = new FormData()
            formData.append('src', result, result.name + '.jp2')
            // console.log(formData.entries())
            formData.append('title', title)
            formData.append('group', group)
            formData.append('creator', user)
            store
              .dispatch('posts/postPost', { group, data: formData })
              .then(router.push('/'))
          }
        })
      }
    },
    head() {
      return {
        title: 'Einen Beitrag Posten',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Poste hier deinen eigenen Beitrag'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.btn {
  @apply font-light bg-transparent text-white py-2 px-4 mt-2 border border-white transition-colors duration-200;
}
.btn:hover {
  @apply bg-white text-grey border-transparent;
}

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>
