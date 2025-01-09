class AmazonSearchAutomation {
    constructor() {
        this.screenshots = [];
        this.searchResults = [];
        this.isReady = false;
    }

    async init() {
        try {
            this.isReady = await this.navigateToAmazon();
            return this.isReady;
        } catch (error) {
            console.error('Error initializing automation:', error);
            return false;
        }
    }

    async navigateToAmazon() {
        try {
            await puppeteer_navigate({ url: 'https://www.amazon.com' });
            await this.handleInitialDialogs();
            await this.takeScreenshot('1-initial-page.png');
            console.log('Successfully navigated to Amazon');
            return true;
        } catch (error) {
            console.error('Error navigating to Amazon:', error);
            return false;
        }
    }

    async handleInitialDialogs() {
        try {
            await puppeteer_evaluate({
                script: `
                    const continueButton = Array.from(document.querySelectorAll('button'))
                        .find(b => b.textContent.includes('Continuar'));
                    if (continueButton) continueButton.click();
                `
            });
            return true;
        } catch (error) {
            console.error('Error handling dialogs:', error);
            return false;
        }
    }

    async searchProduct(keyword) {
        if (!this.isReady) {
            console.error('Automation not initialized');
            return false;
        }

        try {
            await puppeteer_fill({ 
                selector: '#twotabsearchtextbox', 
                value: keyword 
            });
            await puppeteer_click({ 
                selector: '#nav-search-submit-button'
            });
            await this.takeScreenshot('2-search-results.png');
            console.log(`Successfully searched for ${keyword}`);
            return true;
        } catch (error) {
            console.error('Error searching for product:', error);
            return false;
        }
    }

    async filterByBrand(brand) {
        if (!this.isReady) return false;

        try {
            const brandFilterFound = await puppeteer_evaluate({
                script: `
                    function findBrandElement() {
                        const brandSection = document.querySelector('#brandsRefinements');
                        if (!brandSection) return null;
                        
                        const links = brandSection.querySelectorAll('a');
                        return Array.from(links).find(link => 
                            link.textContent.toLowerCase().includes('${brand.toLowerCase()}')
                        );
                    }

                    function findBrandAnywhere() {
                        return Array.from(document.querySelectorAll('a')).find(link => 
                            link.textContent.toLowerCase().includes('${brand.toLowerCase()}')
                        );
                    }

                    const element = findBrandElement() || findBrandAnywhere();
                    if (element) {
                        element.click();
                        return true;
                    }
                    return false;
                `
            });

            if (brandFilterFound) {
                await this.takeScreenshot('3-brand-filter.png');
                console.log(`Successfully filtered by ${brand}`);
                return true;
            }

            console.error(`Brand ${brand} not found`);
            return false;
        } catch (error) {
            console.error('Error filtering by brand:', error);
            return false;
        }
    }

    async setPriceRange(min, max) {
        if (!this.isReady) return false;

        try {
            await puppeteer_fill({ 
                selector: '#low-price', 
                value: min.toString() 
            });
            await puppeteer_fill({ 
                selector: '#high-price', 
                value: max.toString() 
            });
            
            // Buscar y hacer clic en el botón de precio
            await puppeteer_evaluate({
                script: `
                    const priceButton = Array.from(document.querySelectorAll('input[type="submit"]'))
                        .find(button => button.getAttribute('aria-labelledby')?.includes('a-autoid-1'));
                    if (priceButton) priceButton.click();
                `
            });

            await this.takeScreenshot('4-price-filter.png');
            console.log(`Successfully set price range: $${min} - $${max}`);
            return true;
        } catch (error) {
            console.error('Error setting price range:', error);
            return false;
        }
    }

    async getResultsCount() {
        if (!this.isReady) return null;

        try {
            const count = await puppeteer_evaluate({
                script: `
                    const element = document.querySelector('.a-section.a-spacing-small.a-spacing-top-small span:first-child');
                    return element ? element.textContent : null;
                `
            });
            console.log('Results count:', count);
            return count;
        } catch (error) {
            console.error('Error getting results count:', error);
            return null;
        }
    }

    async sortByPrice(ascending = false) {
        if (!this.isReady) return false;

        try {
            await puppeteer_click({ 
                selector: '#a-autoid-0-announce' 
            });
            await puppeteer_click({ 
                selector: ascending ? '#s-result-sort-select_1' : '#s-result-sort-select_2'
            });
            await this.takeScreenshot('5-sort-by-price.png');
            console.log('Successfully sorted by price');
            return true;
        } catch (error) {
            console.error('Error sorting by price:', error);
            return false;
        }
    }

    async getTopProducts(count = 5) {
        if (!this.isReady) return [];

        try {
            const products = await puppeteer_evaluate({
                script: `
                    const items = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
                    const results = [];
                    for (let i = 0; i < Math.min(${count}, items.length); i++) {
                        const item = items[i];
                        const title = item.querySelector('h2 span')?.textContent;
                        const price = item.querySelector('.a-price-whole')?.textContent;
                        if (title && price) {
                            results.push({ title, price: '$' + price });
                        }
                    }
                    return results;
                `
            });
            this.searchResults = products;
            console.log('Top products:', products);
            return products;
        } catch (error) {
            console.error('Error getting top products:', error);
            return [];
        }
    }

    async takeScreenshot(filename) {
        try {
            await puppeteer_screenshot({ name: filename });
            this.screenshots.push(filename);
            return true;
        } catch (error) {
            console.error('Error taking screenshot:', error);
            return false;
        }
    }
}

module.exports = AmazonSearchAutomation;