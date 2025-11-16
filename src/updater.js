import { checkFeedUpdates } from './rss.js';

class FeedUpdater {
  constructor(updateCallback, interval = 5000) {
    this.updateCallback = updateCallback;
    this.interval = interval;
    this.timeoutId = null;
    this.isUpdating = false;
    this.feeds = [];
  }

  // Установка списка фидов для отслеживания
  setFeeds(feeds) {
    this.feeds = feeds;
  }

  // Добавление одного фида
  addFeed(feed) {
    this.feeds.push(feed);
  }

  // Запуск автоматического обновления
  start() {
    this.stop(); // Останавливаем предыдущий таймер
    this.scheduleUpdate();
  }

  // Остановка автоматического обновления
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Планирование следующего обновления
  scheduleUpdate() {
    this.timeoutId = setTimeout(() => {
      this.performUpdate();
    }, this.interval);
  }

  // Выполнение проверки обновлений
  async performUpdate() {
    if (this.isUpdating || this.feeds.length === 0) {
      this.scheduleUpdate();
      return;
    }

    this.isUpdating = true;

    try {
      // Проверяем все фиды параллельно
      const updatePromises = this.feeds.map(feed => 
        this.updateCallback(feed.url)
      );

      const results = await Promise.allSettled(updatePromises);
      
      // Обрабатываем результаты
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const feedUrl = this.feeds[index].url;
          console.log(`Checked ${feedUrl}: ${result.value.newPosts.length} new posts`);
        } else if (result.status === 'rejected') {
          console.error(`Error checking feed ${this.feeds[index].url}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Error during feed update cycle:', error);
    } finally {
      this.isUpdating = false;
      this.scheduleUpdate(); // Планируем следующее обновление
    }
  }

  // Принудительная проверка обновлений
  async forceUpdate() {
    if (this.isUpdating) return;
    
    await this.performUpdate();
  }
}

export default FeedUpdater;
