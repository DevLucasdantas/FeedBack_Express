const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const FEEDBACKS_FILE = path.join(__dirname, 'data', 'feedbacks.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Ensure data directory exists
if (!fs.existsSync(path.dirname(FEEDBACKS_FILE))) {
    fs.mkdirSync(path.dirname(FEEDBACKS_FILE), { recursive: true });
}

// API Route to handle feedback
app.post('/api/feedback', (req, res) => {
    const { feedback, name } = req.body;
    
    if (!feedback) {
        return res.status(400).json({ error: 'O feedback é obrigatório' });
    }
    
    try {
        // Read existing feedbacks
        let feedbacks = [];
        if (fs.existsSync(FEEDBACKS_FILE)) {
            feedbacks = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, 'utf8'));
        }
        
        // Add new feedback
        const newFeedback = {
            id: Date.now(),
            name: name || 'Anônimo',
            feedback,
            timestamp: new Date().toISOString()
        };
        
        feedbacks.push(newFeedback);
        fs.writeFileSync(FEEDBACKS_FILE, JSON.stringify(feedbacks, null, 2));
        
        // Generate response
        const responses = [
            `Obrigado pelo seu feedback, ${name || 'Anônimo'}! Seu comentário foi registrado.`,
            `Feedback recebido com sucesso! Valorizamos sua opinião, ${name || 'Anônimo'}.`,
            `Seu feedback foi armazenado. Obrigado por contribuir, ${name || 'Anônimo'}!`
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        res.json({ 
            status: 'success',
            message: 'Feedback recebido com sucesso',
            response: randomResponse,
            feedback: newFeedback
        });
    } catch (error) {
        console.error('Erro ao salvar feedback:', error);
        res.status(500).json({ error: 'Erro interno ao processar feedback' });
    }
});

// Default route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

