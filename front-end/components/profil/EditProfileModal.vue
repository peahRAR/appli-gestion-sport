<template>
  <div class="w-full container m-auto">
    <TheModal :isOpen="isOpen" title="Modifications" @close="cancelEdit">
      <!-- Avatar -->
      <UploadAvatar
        :user-avatar="user.avatar"
        @avatarSaved="updateAvatar"
        message="Fichier image png, jpeg ou jpg de moins de 3 Mo"
      />

      <!-- Poids -->
      <div class="w-full flex items-baseline mt-4">
        <p>Poids :</p>
        <input
          type="number"
          step="0.01"
          v-model="editedWeight"
          @input="updateField('editedWeight', $event.target.value)"
          placeholder="Nouveau poids"
          class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2"
        />
        <p class="ml-2">Kg</p>
      </div>

      <!-- Téléphones -->
      <div class="w-full flex items-baseline">
        <p>Téléphone portable :</p>
        <input
          type="text"
          v-model="editedTelNum"
          @input="updateField('editedTelNum', $event.target.value)"
          placeholder="Nouveau numéro"
          class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2"
        />
      </div>

      <div class="w-full flex items-baseline">
        <p>Téléphone médicale :</p>
        <input
          type="text"
          v-model="editedTelMedic"
          @input="updateField('editedTelMedic', $event.target.value)"
          placeholder="Nouveau téléphone médical"
          class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2"
        />
      </div>

      <div class="w-full flex items-baseline">
        <p>Téléphone d'urgence :</p>
        <input
          type="text"
          v-model="editedTelEmergency"
          @input="updateField('editedTelEmergency', $event.target.value)"
          placeholder="Nouveau téléphone d'urgence"
          class="w-32 mb-4 ml-2 focus-visible:outline-none border-solid border-black border-b-2"
        />
      </div>

      <!-- Licences par fédération (nouveau système) -->
      <div class="mt-6">
        <div class="flex items-center justify-between">
          <p class="font-semibold">Licences</p>
          <span v-if="licensesLoading" class="text-sm text-slate-500">Chargement…</span>
        </div>

        <p v-if="licensesError" class="mt-2 text-sm text-red-600">{{ licensesError }}</p>

        <div v-if="!licensesLoading" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="fed in federationsForDisplay"
            :key="fed.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div class="flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {{ fed.code }}
              </div>
              <div class="text-[11px] text-slate-500">
                {{ fed.name }}
              </div>
            </div>
            <div class="mt-2">
              <label class="block text-xs font-medium text-slate-600 mb-1">Numéro de licence</label>
              <input
                v-model="licenseMap[fed.code].number"
                @input="markTouched(fed.code)"
                type="text"
                placeholder="Non renseigné"
                class="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p
                v-if="licenseMap[fed.code].original && !licenseMap[fed.code].touched"
                class="mt-1 text-[11px] text-slate-500"
              >
                Actuel : {{ licenseMap[fed.code].original }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="!licensesLoading && federationsForDisplay.length === 0" class="mt-2 text-sm text-slate-500">
          Aucune fédération disponible.
        </p>
      </div>

      <!-- Actions -->
      <button
        @click="saveChanges"
        class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 text-center rounded mt-6"
        :disabled="saving"
      >
        {{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}
      </button>
    </TheModal>
  </div>
</template>

<script>
export default {
  name: 'EditProfileModal',
  props: {
    isOpen: { type: Boolean, default: false },
    user: { type: Object, required: true },
    baseUrl: { type: String, required: true },
  },
  data() {
    return {
      // Profil
      editedWeight: this.user.weight ?? '',
      editedTelNum: this.user.tel_num ?? '',
      editedTelMedic: this.user.tel_medic ?? '',
      editedTelEmergency: this.user.tel_emergency ?? '',
      avatarBlob: null,

      // Licences
      licensesLoading: false,
      licensesError: null,
      federations: [],      // [{ id, code, name }]
      licenses: [],         // [{ id, federation:{code,name}, number_plain, ...}]
      licenseMap: {},       // code -> { number, original, touched }

      saving: false,
    };
  },
  computed: {
    federationsForDisplay() {
      return this.federations.filter(f => f.code !== 'LEGACY');
    },
  },
  watch: {
    isOpen: {
      immediate: true,
      async handler(v) {
        if (v) {
          // réhydrate les champs depuis l'utilisateur courant
          this.editedWeight = this.user?.weight ?? '';
          this.editedTelNum = this.user?.tel_num ?? '';
          this.editedTelMedic = this.user?.tel_medic ?? '';
          this.editedTelEmergency = this.user?.tel_emergency ?? '';
          this.avatarBlob = null;

          await this.loadLicensesData();
        }
      }
    }
  },
  methods: {
    // -------------- Utils payload --------------
    isBlank(v) {
      return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
    },
    cleanObject(obj) {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => !this.isBlank(v))
      );
    },
    buildPatch(original, updates) {
      // Construit un PATCH minimal : pas de champs vides, pas de champs identiques
      const cleaned = this.cleanObject(updates);
      return Object.fromEntries(
        Object.entries(cleaned).filter(([k, v]) => {
          const orig = original?.[k];
          // Comparaison tolérante : on trim les strings
          const norm = x => (typeof x === 'string' ? x.trim() : x);
          return norm(v) !== norm(orig);
        })
      );
    },

    // -------------- Form helpers --------------
    updateField(field, value) {
      // normalisation rapide : trim sur string, conversion number si besoin
      let val = value;
      if (typeof val === 'string') val = val.replace(/\s+/g, ' ').trim();
      if (field === 'editedWeight' && val !== '' && !Number.isNaN(Number(val))) {
        val = Number(val);
      }
      this[field] = val;
      this.$emit(`update:${field}`, val);
    },
    updateAvatar(blob) {
      this.avatarBlob = blob instanceof Blob ? blob : null;
    },
    token() {
      return localStorage.getItem('accessToken');
    },

    // -------------- Licences --------------
    async loadLicensesData() {
      this.licensesLoading = true;
      this.licensesError = null;
      try {
        const base = this.baseUrl.replace(/\/+$/, '');
        const uid = this.user?.id;
        if (!uid) return;

        const [fedsRes, licRes] = await Promise.all([
          fetch(`${base}/users/federations`), // public
          fetch(`${base}/users/${uid}/licenses`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token()}`
            }
          }),
        ]);
        if (!fedsRes.ok) throw new Error('Erreur chargement fédérations');
        if (!licRes.ok) throw new Error('Erreur chargement licences');

        this.federations = await fedsRes.json();
        this.licenses = await licRes.json();

        // Build map code -> { number, original, touched }
        const map = {};
        for (const f of this.federations) {
          if (f.code === 'LEGACY') continue;
          const found = this.licenses.find(l => l?.federation?.code === f.code);
          map[f.code] = {
            number: (found?.number_plain ?? '').toString(),
            original: (found?.number_plain ?? '').toString(),
            touched: false,
          };
        }
        this.licenseMap = map;
      } catch (e) {
        this.licensesError = e?.message || 'Erreur de chargement';
      } finally {
        this.licensesLoading = false;
      }
    },
    markTouched(code) {
      if (this.licenseMap[code]) this.licenseMap[code].touched = true;
    },

    // -------------- Submit --------------
    saveChanges() {
      // 1) Prépare les updates profil depuis les champs édités (SANS héritage de this.user)
      const profileRaw = {
        weight: this.editedWeight,         // number | ''
        tel_num: this.editedTelNum,        // string | ''
        tel_medic: this.editedTelMedic,    // string | ''
        tel_emergency: this.editedTelEmergency, // string | ''
      };

      // 2) Construit le PATCH minimal (ne contient QUE les champs modifiés et non vides)
      const userPatch = this.buildPatch(this.user, profileRaw);

      // 3) Avatar : on ne l’ajoute QUE s’il est présent (sinon on ne met rien)
      // On ne met PAS avatar=null pour éviter tout écrasement côté back.
      if (this.avatarBlob instanceof Blob) {
        // On passe l’avatar à part pour que le parent puisse faire un FormData
        userPatch.__hasAvatar = true; // flag simple pour aider le parent
      }

      // 4) Licences : uniquement les modifiées ET non vides
      const licenses = Object.entries(this.licenseMap)
        .filter(([, v]) => v.touched && v.number && v.number.trim() !== '')
        .map(([federationCode, v]) => ({ federationCode, number: v.number.trim() }));

      // 5) Émission vers le parent
      // - profile => patch minimal prêt pour un PATCH JSON
      // - avatar  => blob optionnel, parent décidera d’utiliser FormData si présent
      // - licenses => tableau épuré
      this.$emit('saveChanges', {
        profile: userPatch,
        avatar: this.avatarBlob ?? null,
        licenses
      });
    },

    cancelEdit() {
      this.$emit('cancelEdit');
    }
  }
};
</script>

