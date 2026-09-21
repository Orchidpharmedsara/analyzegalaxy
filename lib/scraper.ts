import { chromium } from 'playwright-core';

export interface InstagramBaseline {
  followerCount: number | null;
  bio: string | null;
  medianViewsLast10: number | null;
}

export async function getInstagramBaseline(username: string): Promise<InstagramBaseline> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  const result: InstagramBaseline = {
    followerCount: null,
    bio: null,
    medianViewsLast10: null,
  };

  try {
    console.log(`[scraper] Navigating to https://www.instagram.com/${username}/`);
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle', timeout: 30000 });

    // 1. Get follower count
    const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
    if (metaDescription) {
      const match = metaDescription.match(/([\d,.]+[a-zA-Z]?)\s+Followers/i);
      if (match) {
        let countStr = match[1].replace(/,/g, '');
        if (countStr.toLowerCase().endsWith('m')) {
          result.followerCount = parseFloat(countStr) * 1000000;
        } else if (countStr.toLowerCase().endsWith('k')) {
          result.followerCount = parseFloat(countStr) * 1000;
        } else {
          result.followerCount = parseInt(countStr, 10);
        }
      }
    }

    // 2. Get bio
    try {
      const bioElement = await page.$('h1 + span');
      if (bioElement) {
        result.bio = await bioElement.innerText();
      }
    } catch (e) {}

    // 3. Get median views of last 10 reels.
    await page.goto(`https://www.instagram.com/${username}/reels/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const viewCounts = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      const playIcons = svgs.filter(svg => svg.getAttribute('aria-label') === 'Play' || svg.innerHTML.includes('M5.888 22.5a3.46'));
      
      const views: number[] = [];
      for (const svg of playIcons) {
        const container = svg.closest('div');
        if (container && container.parentElement) {
          const text = container.parentElement.innerText;
          const match = text.match(/([\d,.]+)[KkMm]?/);
          if (match) {
            let num = parseFloat(match[1].replace(/,/g, ''));
            if (text.toLowerCase().includes('m')) num *= 1000000;
            else if (text.toLowerCase().includes('k')) num *= 1000;
            if (!isNaN(num)) views.push(num);
          }
        }
      }
      return views;
    });

    if (viewCounts.length > 0) {
      const last10 = viewCounts.slice(0, 10);
      last10.sort((a, b) => a - b);
      const mid = Math.floor(last10.length / 2);
      result.medianViewsLast10 = last10.length % 2 !== 0 ? last10[mid] : (last10[mid - 1] + last10[mid]) / 2;
    }

  } catch (err: any) {
    console.warn(`[scraper] Failed to scrape IG profile: ${err.message}`);
  } finally {
    await browser.close();
  }

  return result;
}
