declare global {
  var db__remixMultistepForms: {
    hasStarted: boolean
    firstName?: string
    lastName?: string
    email?: string
    sawNewsletterOffer: boolean
  }
}

if (!global.db__remixMultistepForms) {
  global.db__remixMultistepForms = {
    hasStarted: false,
    sawNewsletterOffer: false,
  }
}

export default global.db__remixMultistepForms
