export const state = () => ({
  user: {},
  notifications: [],
  gotnotifs: false
})
export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
  },
  GOT_NOTIFS(state) {
    state.gotnotifs = true
  }
}
export const actions = {
  fetchUser({ commit }, id) {
    return this.$axios.get('/users/' + id + '/').then((response) => {
      commit('SET_USER', response.data)
    })
  },
  updateUser({ commit }, data) {
    return this.$axios.put('/users/' + data.pk + '/', data).then((response) => {
      commit('SET_USER', response.data)
    })
  },
  getNotifications({ commit }, user) {
    return this.$axios
      .get('/notifications/?ordering=-time', {
        params: { user }
      })
      .then((response) => {
        commit('SET_NOTIFICATIONS', response.data.results)
        commit('GOT_NOTIFS')
      })
  }
}
