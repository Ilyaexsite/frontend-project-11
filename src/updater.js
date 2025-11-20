class FeedUpdater {
  constructor(updateCallback, interval = 5000) {
    this.updateCallback = updateCallback
    this.interval = interval
    this.timeoutId = null
    this.isUpdating = false
    this.feeds = []
  }

  setFeeds(feeds) {
    this.feeds = feeds
  }

  addFeed(feed) {
    this.feeds.push(feed)
  }

  start() {
    this.stop()
    this.scheduleUpdate()
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  scheduleUpdate() {
    this.timeoutId = setTimeout(() => {
      this.performUpdate()
    }, this.interval)
  }

  async performUpdate() {
    if (this.isUpdating || this.feeds.length === 0) {
      this.scheduleUpdate()
      return
    }

    this.isUpdating = true

    try {
      const updatePromises = this.feeds.map(feed =>
        this.updateCallback(feed.url),
      )

      const results = await Promise.allSettled(updatePromises)

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          console.log('Success:', result.value)
        }
        else if (result.status === 'rejected') {
          console.error('Error:', result.reason)
        }
      })
    }
    finally {
      this.isUpdating = false
      this.scheduleUpdate()
    }
  }

  async forceUpdate() {
    if (this.isUpdating) return

    await this.performUpdate()
  }
}

export default FeedUpdater
