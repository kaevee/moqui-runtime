// MoquiStore.js
// Pinia store providing application state for IoT product screens.
// This store is a read-only mirror of the Moqui root Vue instance state.
// Existing Moqui framework components use $root directly (unchanged).
// New application code must use this store instead of $root.
//
// Policy: no $root access in application code from v3.0 onward.
// Policy: no application code writes directly to this store.
//         Only syncFromRoot() writes to it.

var moquiStore = Pinia.defineStore('moqui', {
    state: function() {
        return {
            // Navigation state
            currentPath: '',
            currentParameters: {},

            // Session state
            userId: '',
            username: '',
            locale: 'en',
            moquiSessionToken: '',
            appRootPath: '',

            // UI state
            loading: false,

            // Notification history (additive only, not cleared by sync)
            notifyHistory: []
        };
    },

    getters: {
        isLoading: function(state) { return state.loading; },
        hasActiveSession: function(state) { return !!state.userId; }
    },

    actions: {
        syncFromRoot: function() {
            if (!moqui.webrootVue) return;
            var root = moqui.webrootVue;
            this.currentPath         = root.currentPath         || '';
            this.currentParameters   = root.currentParameters   || {};
            this.userId              = root.userId              || '';
            this.username            = root.username            || '';
            this.locale              = root.locale              || 'en';
            this.moquiSessionToken   = root.moquiSessionToken   || '';
            this.appRootPath         = root.appRootPath         || '';
            this.loading             = !!root.loading;
        },

        addNotifyHistory: function(message, type) {
            this.notifyHistory.push({
                message: message,
                type: type || 'info',
                timestamp: Date.now()
            });
            // Keep last 100 notifications only
            if (this.notifyHistory.length > 100) {
                this.notifyHistory.splice(0, this.notifyHistory.length - 100);
            }
        }
    }
});

// Expose on moqui global for access from .qvue files and composables.
// Usage in a .qvue component:
//   var store = moqui.store();
//   this.token = store.moquiSessionToken;
moqui.store = moquiStore;
