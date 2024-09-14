const cryptocurrencies = [
    { symbol: 'BTC', name: 'Bitcoin', price: 30000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2000 },
    { symbol: 'BNB', name: 'Binance Coin', price: 300 },
    { symbol: 'ADA', name: 'Cardano', price: 1.50 },
    { symbol: 'SOL', name: 'Solana', price: 30 },
    { symbol: 'XRP', name: 'Ripple', price: 0.50 },
    { symbol: 'DOT', name: 'Polkadot', price: 10 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.06 },
    { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00001 },
    { symbol: 'LTC', name: 'Litecoin', price: 100 },
    { symbol: 'LINK', name: 'Chainlink', price: 15 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.90 },
    { symbol: 'TRX', name: 'Tron', price: 0.07 },
    { symbol: 'XLM', name: 'Stellar', price: 0.13 },
    { symbol: 'UNI', name: 'Uniswap', price: 5 },
    { symbol: 'BCH', name: 'Bitcoin Cash', price: 220 },
    { symbol: 'VET', name: 'VeChain', price: 0.02 },
    { symbol: 'FTM', name: 'Fantom', price: 0.50 },
    { symbol: 'CRO', name: 'Crypto.com Coin', price: 0.60 }
];

const portfolio = {};
let balance = 10000;

// Simpan harga beli untuk setiap cryptocurrency
const purchasePrices = {};

// Data dummy untuk grafik
const chartData = cryptocurrencies.reduce((data, crypto) => {
    data[crypto.symbol] = { labels: [], data: [] };
    return data;
}, {});

// Simpan data ke localStorage
function saveData() {
    localStorage.setItem('balance', balance);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// Muat data dari localStorage
function loadData() {
    const savedBalance = localStorage.getItem('balance');
    const savedPortfolio = localStorage.getItem('portfolio');

    if (savedBalance !== null) {
        balance = parseFloat(savedBalance);
    }

    if (savedPortfolio !== null) {
        Object.assign(portfolio, JSON.parse(savedPortfolio));
    }
}

// Tampilkan Daftar Cryptocurrency
function renderCryptoList() {
    const cryptoList = document.getElementById('crypto-list');
    const cryptoSelect = document.getElementById('crypto-select');

    cryptoList.innerHTML = cryptocurrencies.map(crypto => `
        <div>
            <strong>${crypto.symbol}</strong>: ${crypto.name} - $${crypto.price.toFixed(2)}
        </div>
    `).join('');

    cryptoSelect.innerHTML = cryptocurrencies.map(crypto => `
        <option value="${crypto.symbol}">${crypto.symbol} - ${crypto.name}</option>
    `).join('');
}

// Tampilkan Portofolio
function renderPortfolio() {
    const portfolioInfo = document.getElementById('portfolio-info');
    portfolioInfo.innerHTML = Object.keys(portfolio).map(symbol => {
        const crypto = cryptocurrencies.find(c => c.symbol === symbol);
        return `
            <div>
                ${symbol} (${crypto.name}): ${portfolio[symbol].quantity} cryptocurrency (Harga Beli: $${portfolio[symbol].purchasePrice.toFixed(2)})
            </div>
        `;
    }).join('');
}

// Tampilkan Saldo
function renderBalance() {
    document.getElementById('balance').innerText = balance.toFixed(2);
}

// Update harga cryptocurrency secara acak setiap detik
function updateCryptoPrices() {
    cryptocurrencies.forEach(crypto => {
        const randomChange = (Math.random() - 0.5) * 1000; // Perubahan harga acak
        crypto.price = Math.max(crypto.price + randomChange, 0); // Update harga cryptocurrency

        const symbol = crypto.symbol;
        const now = new Date().toLocaleTimeString();
        chartData[symbol].labels.push(now);
        chartData[symbol].data.push(crypto.price);

        // Batasi data grafik untuk 20 titik
        if (chartData[symbol].labels.length > 20) {
            chartData[symbol].labels.shift();
            chartData[symbol].data.shift();
        }
    });

    updateCharts();
}

// Update grafik dengan data terbaru
function updateCharts() {
    const ctxs = cryptocurrencies.reduce((acc, crypto) => {
        acc[crypto.symbol] = document.getElementById(`chart-${crypto.symbol.toLowerCase()}`).getContext('2d');
        return acc;
    }, {});

    cryptocurrencies.forEach(crypto => {
        const ctx = ctxs[crypto.symbol];
        const data = chartData[crypto.symbol];
        const chart = window[`chart${crypto.symbol}`];
        
        if (chart) {
            chart.data.labels = data.labels;
            chart.data.datasets[0].data = data.data;
            chart.update();
        } else {
            window[`chart${crypto.symbol}`] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: `Harga ${crypto.name}`,
                        data: data.data,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    });
}

// Proses Transaksi
function handleTransaction(action) {
    const cryptoSymbol = document.getElementById('crypto-select').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const crypto = cryptocurrencies.find(c => c.symbol === cryptoSymbol);

    if (!cryptoSymbol || isNaN(quantity) || quantity <= 0) {
        alert('Silakan masukkan jumlah yang valid.');
        return;
    }

    const totalCost = crypto.price * quantity;

    if (action === 'buy') {
        if (balance < totalCost) {
            alert('Saldo tidak mencukupi.');
            return;
        }
        if (!portfolio[cryptoSymbol]) {
            portfolio[cryptoSymbol] = { quantity: 0, purchasePrice: crypto.price };
        }
        portfolio[cryptoSymbol].quantity += quantity;
        balance -= totalCost;
        purchasePrices[cryptoSymbol] = crypto.price; // Simpan harga beli terakhir
    } else if (action === 'sell') {
        if (!portfolio[cryptoSymbol] || portfolio[cryptoSymbol].quantity < quantity) {
            alert('Jumlah cryptocurrency yang Anda miliki tidak mencukupi.');
            return;
        }

        const purchasePrice = portfolio[cryptoSymbol].purchasePrice;
        const totalPurchaseCost = purchasePrice * quantity;
        const sellingPrice = purchasePrice * 1.85; // Tambahkan 5% keuntungan
        const totalSellingCost = sellingPrice * quantity;
        const profit = totalSellingCost - totalPurchaseCost;
        const profitPercentage = (profit / totalPurchaseCost) * 100;

        alert(`Keuntungan: $${profit.toFixed(2)} (${profitPercentage.toFixed(2)}%)`);

        portfolio[cryptoSymbol].quantity -= quantity;
        balance += totalSellingCost;
        if (portfolio[cryptoSymbol].quantity === 0) {
            delete portfolio[cryptoSymbol];
        }
    }

    renderPortfolio();
    renderBalance();
    saveData(); // Simpan data setelah transaksi
}

// Top-Up Saldo
function handleTopUp() {
    const topUpAmount = prompt('Masukkan jumlah top-up:');
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
        balance += amount;
        renderBalance();
        saveData(); // Simpan data setelah top-up
    } else {
        alert('Jumlah top-up tidak valid.');
    }
}

// Render Data Awal
function initialize() {
    loadData(); // Muat data dari localStorage
    renderCryptoList();
    renderPortfolio();
    renderBalance();
    updateCharts();
    setInterval(updateCryptoPrices, 1000); // Update harga cryptocurrency setiap 1 detik
}

initialize();

// Event Listener
document.getElementById('buy-button').addEventListener('click', () => handleTransaction('buy'));
document.getElementById('sell-button').addEventListener('click', () => handleTransaction('sell'));
document.getElementById('top-up-button').addEventListener('click', handleTopUp);
