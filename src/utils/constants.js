import axeCore from 'axe-core'

export const defaultOptions = {
  auto: true,
  config: {
    branding: {
      application: 'vue-axe'
    },
    locale: null,
    rules: [
      {
        id: 'aria-allowed-attr',
        impact: 'critical',
        matches: 'aria-allowed-attr-matches',
        tags: [ 'cat.aria', 'wcag2a', 'wcag412', 'EN-301-549', 'EN-9.4.1.2' ],
        actIds: [ '5c01ea' ],
        all: [ {
          options: {
            validTreeRowAttrs: [ 'aria-multiselectable' ],
            validGridRowAttrs: [ 'aria-multiselectable' ],
            validInputRowAttrs: [ 'aria-multiselectable' ],
            validTablistRowAttrs: [ 'aria-multiselectable' ]
          },
          id: 'aria-allowed-attr'
        } ],
        any: [],
        none: [ 'aria-unsupported-attr' ]
      },
    ]
  },
  runOptions: {
    reporter: 'v2',
    resultTypes: ['violations']
  },
  plugins: []
}

export const impacts = [...axeCore.constants.impact].reverse()

export const vueAxe = Symbol('vue-axe')
