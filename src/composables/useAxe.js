import axeCore from 'axe-core'
import { ref, nextTick } from 'vue'
import { impacts } from '@/utils/constants'

let lastNotification = 0

export default function useAxe (axeOptions) {
  const results = ref({})
  const error = ref(null)
  const loading = ref(false)

  axeCore.configure({ ...axeOptions.config })
  axeOptions.plugins.forEach(plugin => axeCore.registerPlugin(plugin))

  function axeCoreRun (context, runOptions) {
    axeCore.run(context, runOptions, (error, res) => {
      try {
        if (error) throw Error(error)
        if (JSON.stringify([...res.violations]).length === lastNotification) return
        results.value = {
          testEngine: res.testEngine,
          issuesFound: res.violations.length,
          lastAudition: '5min', // use timeago
          impacts: violationsByImpacts(res.violations)
        }
        lastNotification = JSON.stringify([...res.violations]).length
      } catch (e) {
        error.value = e
      } finally {
        loading.value = false
      }
    })
  }

  function run ({
    context = document,
    runOptions = axeOptions.runOptions,
    force = false
  } = {}) {
    if (force) resetLastNotification()
    nextTick(() => axeCoreRun(context, runOptions))
  }

  function violationsByImpacts (violations) {
    return violations.reduce((obj, data) => {
      impacts.forEach(impact => {
        if (!obj[impact]) {
          obj[impact] = []
        }
        if (data.impact === impact) obj[impact].push(data)
      })
      return obj
    }, {})
  }

  function resetLastNotification () {
    lastNotification = 0
  }

  return {
    run,
    error,
    results,
    loading,
    plugins: axeCore.plugins
  }
}
