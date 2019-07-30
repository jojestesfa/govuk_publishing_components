(function () {
  'use strict'
  window.GOVUK = window.GOVUK || {}
  var GOVUK = window.GOVUK || {}

  var YoutubeLinkEnhancement = function ($element) {
    this.$element = $element
  }

  YoutubeLinkEnhancement.prototype.init = function () {
    if (!this.campaignCookiesAllowed()) {
      return
    }

    var $youtubeLinks = this.$element.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]')

    for (var i = 0; i < $youtubeLinks.length; ++i) {
      var $youtubeLink = $youtubeLinks[i]
      var elementId = YoutubeLinkEnhancement.nextId()
      var videoId = YoutubeLinkEnhancement.parseVideoId($youtubeLink.getAttribute('href'))

      if (!this.hasDisabledEmbed($youtubeLink) && videoId) {
        var parentDiv = document.createElement('div')
        parentDiv.classList += 'gem-c-govspeak__youtube-video'

        var iframe = document.createElement("iframe")
        iframe.id = elementId
        iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + videoId + '?enablejsapi=1&origin= ' + window.location.origin + '&rel=0&disablekb=1&modestbranding=1')
        iframe.setAttribute('title', $youtubeLink.textContent + ' (video)')
        iframe.setAttribute('data-video-id', videoId)
        iframe.setAttribute('frameborder', 0)
        iframe.setAttribute('allowfullscreen', 1)
        iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture')

        var parentPara = $youtubeLink.parentNode
        var parentContainer = parentPara.parentNode

        parentDiv.appendChild(iframe)
        parentContainer.replaceChild(parentDiv, parentPara)

        window.onYouTubeIframeAPIReady = function() {
          new YT.Player(elementId, {});
        }
      }
    }

    if (!this.youtubeApiInserted) {
      var tag = document.createElement('script')
      tag.id = 'iframe-demo'
      tag.src = 'https://www.youtube.com/iframe_api'
      var firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      this.youtubeApiInserted = true
    }
  }

  YoutubeLinkEnhancement.prototype.campaignCookiesAllowed = function () {
    var cookiePolicy = window.GOVUK.getConsentCookie()
    return cookiePolicy !== null ? cookiePolicy.campaigns : true
  }

  YoutubeLinkEnhancement.prototype.hasDisabledEmbed = function ($link) {
    return $link.getAttribute('data-youtube-player') === 'off'
  }

  // This is a public class method so it can be used outside of this embed to
  // check that user input for videos will be supported in govspeak
  YoutubeLinkEnhancement.parseVideoId = function (url) {
    var parts

    if (url.indexOf('youtube.com') > -1) {
      var params = {}
      parts = url.split('?')
      if (parts.length === 1) {
        return
      }
      parts = parts[1].split('&')
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i].split('=')
        params[part[0]] = part[1]
      }
      return params.v
    }

    if (url.indexOf('youtu.be') > -1) {
      parts = url.split('/')
      return parts.pop()
    }
  }

  YoutubeLinkEnhancement.nextId = function () {
    this.embedCount = this.embedCount || 0
    this.embedCount += 1
    return 'youtube-' + this.embedCount
  }



  /*YoutubeLinkEnhancement.prototype.init = function () {
    if (!this.campaignCookiesAllowed()) {
      return
    }

    var $youtubeLinks = this.$element.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"]')

    if ($youtubeLinks.length > 0) {
      YoutubeLinkEnhancement.insertApiScript()
    }

    for (var i = 0; i < $youtubeLinks.length; ++i) {
      var $link = $youtubeLinks[i]

      var httpsHref = $link.getAttribute('href').replace('http://', 'https://')
      $link.setAttribute('href', httpsHref)

      var videoId = YoutubeLinkEnhancement.parseVideoId($link.getAttribute('href'))
      console.log("VIDEO LINK:" + $link.getAttribute('href'))

      if (!this.hasDisabledEmbed($link) && videoId) {
        this.setupVideo($link, videoId)
      }
    }
  }

  YoutubeLinkEnhancement.prototype.hasDisabledEmbed = function ($link) {
    return $link.getAttribute('data-youtube-player') === 'off'
  }

  YoutubeLinkEnhancement.prototype.setupVideo = function ($link, videoId) {
    var elementId = YoutubeLinkEnhancement.nextId()

    var parentPara = $link.parentNode
    var parentContainer = parentPara.parentNode

    var youtubeVideoContainer = document.createElement('div')
    youtubeVideoContainer.innerHTML = '<span id="' + elementId + '" data-video-id="' + videoId + '"></span>'

    parentContainer.replaceChild(youtubeVideoContainer, parentPara)
    this.insertVideo(elementId, videoId, $link.textContent)
  }

  YoutubeLinkEnhancement.prototype.insertVideo = function (elementId, videoId, title) {
    console.log("SETTING UP PLAYER FUNCTION")
    var videoInsert = function () {
      console.log("SETTING UP PLAYER")
      new window.YT.Player(elementId, { // eslint-disable-line no-new
        videoId: videoId,
        host: '//www.youtube-nocookie.com',
        playerVars: {
          // enables the player to be controlled via IFrame or JavaScript Player API calls
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
          // don't show related videos
          rel: 0,
          // disable option to allow single key shortcuts due to (WCAG SC 2.1.4)
          // https://www.w3.org/WAI/WCAG21/quickref/#character-key-shortcuts
          disablekb: 1,
          // prevent the YouTube logo from displaying in the control bar
          modestbranding: 1
        }
      })
    }

    videoInsert = videoInsert.bind(this)

    if (YoutubeLinkEnhancement.playerApiReady) {
      videoInsert.call()
    } else {
      YoutubeLinkEnhancement.queuedInserts.push(videoInsert)
    }
  }

  YoutubeLinkEnhancement.prototype.campaignCookiesAllowed = function () {
    var cookiePolicy = window.GOVUK.getConsentCookie()
    return cookiePolicy !== null ? cookiePolicy.campaigns : true
  }

  YoutubeLinkEnhancement.nextId = function () {
    this.embedCount = this.embedCount || 0
    this.embedCount += 1
    return 'youtube-' + this.embedCount
  }

  YoutubeLinkEnhancement.insertApiScript = function () {
    if (this.apiScriptInserted) {
      return
    }

    var tag = document.createElement('script')
    tag.src = '//www.youtube.com/iframe_api'
    var firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    this.apiScriptInserted = true
  }

  // This is a public class method so it can be used outside of this embed to
  // check that user input for videos will be supported in govspeak
  YoutubeLinkEnhancement.parseVideoId = function (url) {
    var parts

    if (url.indexOf('youtube.com') > -1) {
      var params = {}
      parts = url.split('?')
      if (parts.length === 1) {
        return
      }
      parts = parts[1].split('&')
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i].split('=')
        params[part[0]] = part[1]
      }
      return params.v
    }

    if (url.indexOf('youtu.be') > -1) {
      parts = url.split('/')
      return parts.pop()
    }
  }

  YoutubeLinkEnhancement.apiScriptInserted = false
  YoutubeLinkEnhancement.playerApiReady = false
  // an array of functions to be called once the Youtube Player API is ready
  YoutubeLinkEnhancement.queuedInserts = []

  window.onYouTubeIframeAPIReady = function () {
    YoutubeLinkEnhancement.playerApiReady = true
    console.log("PLAYER READY")
    for (var i = 0; i < YoutubeLinkEnhancement.queuedInserts.length; i++) {
      YoutubeLinkEnhancement.queuedInserts[i].call()
    }
  }*/

  GOVUK.GovspeakYoutubeLinkEnhancement = YoutubeLinkEnhancement
})()
