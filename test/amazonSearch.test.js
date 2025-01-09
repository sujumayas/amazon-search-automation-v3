const AmazonSearchAutomation = require('../src/amazonSearch');

describe('Amazon Search Automation', () => {
    let automation;

    beforeEach(() => {
        automation = new AmazonSearchAutomation();
    });

    test('should initialize successfully', async () => {
        const result = await automation.init();
        expect(result).toBe(true);
        expect(automation.isReady).toBe(true);
    });

    test('should search for a product', async () => {
        await automation.init();
        const result = await automation.searchProduct('zapatos');
        expect(result).toBe(true);
    });

    test('should filter by brand', async () => {
        await automation.init();
        await automation.searchProduct('zapatos');
        const result = await automation.filterByBrand('Skechers');
        expect(result).toBe(true);
    });

    test('should set price range', async () => {
        await automation.init();
        await automation.searchProduct('zapatos');
        const result = await automation.setPriceRange(100, 200);
        expect(result).toBe(true);
    });

    test('should get results count', async () => {
        await automation.init();
        await automation.searchProduct('zapatos');
        const count = await automation.getResultsCount();
        expect(count).not.toBeNull();
    });

    test('should sort by price', async () => {
        await automation.init();
        await automation.searchProduct('zapatos');
        const result = await automation.sortByPrice(false);
        expect(result).toBe(true);
    });

    test('should get top products', async () => {
        await automation.init();
        await automation.searchProduct('zapatos');
        const products = await automation.getTopProducts(5);
        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThan(0);
    });
});