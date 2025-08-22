// ===== FULL-STACK E-LEARNING SERVER WITH POSTGRESQL =====
// Node.js/Express server with Railway PostgreSQL database integration
// Complete implementation replacing mock data with real database operations

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE SETUP =====
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// ===== POSTGRESQL DATABASE CONNECTION =====
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL Database connected successfully');
        client.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// ===== CREATE DATABASE TABLES =====
async function createTables() {
    try {
        const client = await pool.connect();
        
        // Create lessons table
        await client.query(`
            CREATE TABLE IF NOT EXISTS lessons (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create questions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                options JSON NOT NULL,
                correct INTEGER NOT NULL,
                created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database tables created/verified successfully');
        client.release();
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
}

// ===== SEED INITIAL DATA =====
async function seedInitialData() {
    try {
        const client = await pool.connect();
        
        // Check if we already have data
        const lessonsCheck = await client.query('SELECT COUNT(*) FROM lessons');
        const questionsCheck = await client.query('SELECT COUNT(*) FROM questions');
        
        if (lessonsCheck.rows[0].count == 0) {
            console.log('📦 Seeding initial lessons...');
            
            // Insert initial lessons
            const initialLessons = [
                {
                    title: "CIA Triad - The Foundation of Cybersecurity",
                    content: "The CIA Triad is a fundamental model for security, focusing on three key principles: Confidentiality, Integrity, and Availability. Think of it as the bedrock of data and system protection. Confidentiality ensures that sensitive information is only accessible to authorized individuals. Integrity maintains the accuracy and trustworthiness of data throughout its lifecycle. Availability guarantees that information and resources are accessible when needed by authorized users."
                },
                {
                    title: "Non-Repudiation - Ensuring Accountability",
                    content: "Non-Repudiation is about ensuring a party cannot deny an action they have committed. It provides undeniable proof of the origin of a digital transaction or communication, often using digital signatures. This principle is crucial in digital contracts, email communications, and financial transactions where proof of participation is essential for legal and business purposes."
                }
            ];
            
            for (const lesson of initialLessons) {
                await client.query(
                    'INSERT INTO lessons (title, content) VALUES ($1, $2)',
                    [lesson.title, lesson.content]
                );
            }
            console.log(`✅ Seeded ${initialLessons.length} lessons`);
        }
        
        if (questionsCheck.rows[0].count == 0) {
            console.log('📦 Seeding initial questions...');
            
            // All 30 questions from the original prompt
            const initialQuestions = [
                {
                    question: "What is the primary goal of Confidentiality in the CIA Triad?",
                    options: ["To prevent unauthorized access to information.", "To ensure data is accurate and trustworthy.", "To guarantee system uptime and availability.", "To track user actions."],
                    correct: 0
                },
                {
                    question: "Which of the following is an example of a tool used to ensure Confidentiality?",
                    options: ["Firewalls.", "Data encryption.", "System backups.", "Digital signatures."],
                    correct: 1
                },
                {
                    question: "A hacker changing a record in a database is a violation of which principle of the CIA Triad?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "Non-Repudiation."],
                    correct: 1
                },
                {
                    question: "What does 'Integrity' refer to in the context of cybersecurity?",
                    options: ["Keeping data secret.", "Ensuring data has not been modified.", "Making sure data is accessible.", "Proving the origin of a message."],
                    correct: 1
                },
                {
                    question: "A Distributed Denial of Service (DDoS) attack primarily targets which aspect of the CIA Triad?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "Non-Repudiation."],
                    correct: 2
                },
                {
                    question: "What is the main purpose of Availability?",
                    options: ["Ensuring data is not leaked.", "Verifying data is accurate.", "Guaranteeing that authorized users can access resources.", "Preventing a user from denying a sent message."],
                    correct: 2
                },
                {
                    question: "Backing up data and having a disaster recovery plan are measures to protect which principle?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "All of the above."],
                    correct: 2
                },
                {
                    question: "Which of the following is NOT a component of the CIA Triad?",
                    options: ["Confidentiality.", "Integrity.", "Authentication.", "Availability."],
                    correct: 2
                },
                {
                    question: "In the CIA Triad, which principle is concerned with ensuring that data is only accessible to those with a need to know?",
                    options: ["Integrity.", "Availability.", "Confidentiality.", "Both A and C."],
                    correct: 2
                },
                {
                    question: "What is the primary method for maintaining data Integrity?",
                    options: ["Using strong passwords.", "Implementing file hashing and checksums.", "Encrypting network traffic.", "Setting up a firewall."],
                    correct: 1
                },
                {
                    question: "What is the definition of Non-Repudiation?",
                    options: ["The principle of keeping data secret.", "The ability to prove a party's involvement in a digital transaction or communication.", "The process of confirming a user's identity.", "The principle of ensuring data is correct and unaltered."],
                    correct: 1
                },
                {
                    question: "Which technology is commonly used to achieve Non-Repudiation?",
                    options: ["Firewalls.", "Antivirus software.", "Digital signatures.", "System backups."],
                    correct: 2
                },
                {
                    question: "When a user denies sending an email, which cybersecurity principle is being challenged?",
                    options: ["Confidentiality.", "Integrity.", "Non-Repudiation.", "Availability."],
                    correct: 2
                },
                {
                    question: "A signed contract that cannot be denied by the sender is an example of what?",
                    options: ["Confidentiality.", "Integrity.", "Non-Repudiation.", "Availability."],
                    correct: 2
                },
                {
                    question: "Which component of an email helps ensure Non-Repudiation?",
                    options: ["The subject line.", "The sender's IP address.", "A digital signature or certificate.", "The message body."],
                    correct: 2
                },
                {
                    question: "Non-Repudiation is most closely related to which other cybersecurity concept?",
                    options: ["Authentication.", "Authorization.", "Accountability.", "Confidentiality."],
                    correct: 2
                },
                {
                    question: "If a person signs a digital document, and their signature can be cryptographically verified, which principle is being applied?",
                    options: ["Availability.", "Integrity.", "Non-Repudiation.", "All of the above."],
                    correct: 2
                },
                {
                    question: "Which of the following is a primary threat to Non-Repudiation?",
                    options: ["Data loss.", "System downtime.", "Stolen private keys used for a digital signature.", "Unauthorized viewing of data."],
                    correct: 2
                },
                {
                    question: "What is the difference between Authentication and Non-Repudiation?",
                    options: ["Authentication proves who you are; Non-Repudiation proves you did something.", "Authentication proves you did something; Non-Repudiation proves who you are.", "Authentication proves data is accurate; Non-Repudiation proves data is secure.", "There is no difference."],
                    correct: 0
                },
                {
                    question: "Which cryptographic tool is essential for both Integrity and Non-Repudiation?",
                    options: ["Symmetric encryption.", "Asymmetric (public key) cryptography.", "Hashing algorithms.", "Both B and C."],
                    correct: 3
                },
                {
                    question: "What is the 'C' in the CIA Triad?",
                    options: ["Control.", "Confidentiality.", "Cyber-space.", "Connectivity."],
                    correct: 1
                },
                {
                    question: "What is the 'I' in the CIA Triad?",
                    options: ["Identity.", "Information.", "Integrity.", "Internet."],
                    correct: 2
                },
                {
                    question: "What is the 'A' in the CIA Triad?",
                    options: ["Access.", "Assurance.", "Availability.", "Authentication."],
                    correct: 2
                },
                {
                    question: "A strong password policy is a control primarily for which principle?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "Non-Repudiation."],
                    correct: 0
                },
                {
                    question: "Which security measure ensures that a file, once written, cannot be altered without detection?",
                    options: ["Access control lists.", "File encryption.", "Hashing.", "Backups."],
                    correct: 2
                },
                {
                    question: "A company's website goes offline due to a power outage. This is a failure of which principle?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "Non-Repudiation."],
                    correct: 2
                },
                {
                    question: "Which of the following is the best example of a Non-Repudiation measure?",
                    options: ["Usernames and passwords.", "A log file showing who accessed a specific file and when.", "A firewall rule blocking a certain port.", "Encrypting an email."],
                    correct: 1
                },
                {
                    question: "A man-in-the-middle attack that intercepts and alters data in transit is a threat to which principle?",
                    options: ["Confidentiality.", "Integrity.", "Availability.", "Both A and B."],
                    correct: 3
                },
                {
                    question: "Which of the following is a key element of Non-Repudiation?",
                    options: ["Secrecy.", "Undeniable proof.", "Speed.", "Accessibility."],
                    correct: 1
                },
                {
                    question: "When an email sender uses a digital signature, the recipient can verify what two things?",
                    options: ["Confidentiality and Availability.", "Integrity and Non-Repudiation.", "Access and Control.", "Authentication and Authorization."],
                    correct: 1
                }
            ];
            
            for (const question of initialQuestions) {
                await client.query(
                    'INSERT INTO questions (question, options, correct) VALUES ($1, $2, $3)',
                    [question.question, JSON.stringify(question.options), question.correct]
                );
            }
            console.log(`✅ Seeded ${initialQuestions.length} questions`);
        }
        
        client.release();
        console.log('✅ Database initialization complete');
        
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
}

// Simple admin credentials - In production, use proper authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// ===== API ROUTES WITH POSTGRESQL INTEGRATION =====

// GET /api/content - Retrieve all lessons and questions from database
app.get('/api/content', async (req, res) => {
    try {
        const client = await pool.connect();
        
        // Fetch lessons from database
        const lessonsResult = await client.query('SELECT * FROM lessons ORDER BY id');
        
        // Fetch questions from database  
        const questionsResult = await client.query('SELECT * FROM questions ORDER BY id');
        
        const response = {
            lessons: lessonsResult.rows,
            questions: questionsResult.rows,
            timestamp: new Date().toISOString()
        };
        
        client.release();
        console.log(`Content requested - ${lessonsResult.rows.length} lessons, ${questionsResult.rows.length} questions`);
        res.json(response);
        
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to retrieve content' 
        });
    }
});

// POST /api/login - Authenticate admin
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Username and password are required' 
            });
        }
        
        // Check credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            console.log(`Admin login successful for user: ${username}`);
            res.json({ 
                success: true,
                message: 'Login successful',
                user: { username: username },
                timestamp: new Date().toISOString()
            });
        } else {
            console.log(`Admin login failed for user: ${username}`);
            res.status(401).json({ 
                error: 'Unauthorized',
                message: 'Invalid credentials' 
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Login process failed' 
        });
    }
});

// POST /api/lessons - Add a new lesson to database
app.post('/api/lessons', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Validate input
        if (!title || !content) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Title and content are required' 
            });
        }
        
        if (title.trim().length === 0 || content.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Title and content cannot be empty' 
            });
        }
        
        const client = await pool.connect();
        
        // Insert new lesson into database
        const result = await client.query(
            'INSERT INTO lessons (title, content) VALUES ($1, $2) RETURNING *',
            [title.trim(), content.trim()]
        );
        
        const newLesson = result.rows[0];
        client.release();
        
        console.log(`New lesson added: ${newLesson.title} (ID: ${newLesson.id})`);
        res.status(201).json({ 
            success: true,
            message: 'Lesson added successfully',
            lesson: newLesson 
        });
        
    } catch (error) {
        console.error('Error adding lesson:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to add lesson' 
        });
    }
});

// DELETE /api/lessons/:id - Remove a lesson from database
app.delete('/api/lessons/:id', async (req, res) => {
    try {
        const lessonId = parseInt(req.params.id);
        
        if (isNaN(lessonId)) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Invalid lesson ID' 
            });
        }
        
        const client = await pool.connect();
        
        // Delete lesson from database
        const result = await client.query(
            'DELETE FROM lessons WHERE id = $1 RETURNING *',
            [lessonId]
        );
        
        client.release();
        
        if (result.rows.length > 0) {
            const deletedLesson = result.rows[0];
            console.log(`Lesson deleted: ${deletedLesson.title} (ID: ${lessonId})`);
            res.json({ 
                success: true,
                message: 'Lesson deleted successfully',
                deleted: deletedLesson 
            });
        } else {
            res.status(404).json({ 
                error: 'Not found',
                message: 'Lesson not found' 
            });
        }
        
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to delete lesson' 
        });
    }
});

// POST /api/questions - Add a new question to database
app.post('/api/questions', async (req, res) => {
    try {
        const { question, options, correct } = req.body;
        
        // Validate input
        if (!question || !options || correct === undefined) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Question, options, and correct answer are required' 
            });
        }
        
        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Exactly 4 options are required' 
            });
        }
        
        if (correct < 0 || correct > 3 || !Number.isInteger(correct)) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Correct answer must be an integer between 0 and 3' 
            });
        }
        
        // Check if all options have content
        if (options.some(opt => !opt || opt.trim().length === 0)) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'All options must have content' 
            });
        }
        
        const client = await pool.connect();
        
        // Insert new question into database
        const result = await client.query(
            'INSERT INTO questions (question, options, correct) VALUES ($1, $2, $3) RETURNING *',
            [question.trim(), JSON.stringify(options.map(opt => opt.trim())), correct]
        );
        
        const newQuestion = result.rows[0];
        client.release();
        
        console.log(`New question added: ${newQuestion.question.substring(0, 50)}... (ID: ${newQuestion.id})`);
        res.status(201).json({ 
            success: true,
            message: 'Question added successfully',
            question: newQuestion 
        });
        
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to add question' 
        });
    }
});

// DELETE /api/questions/:id - Remove a question from database
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        
        if (isNaN(questionId)) {
            return res.status(400).json({ 
                error: 'Bad request',
                message: 'Invalid question ID' 
            });
        }
        
        const client = await pool.connect();
        
        // Delete question from database
        const result = await client.query(
            'DELETE FROM questions WHERE id = $1 RETURNING *',
            [questionId]
        );
        
        client.release();
        
        if (result.rows.length > 0) {
            const deletedQuestion = result.rows[0];
            console.log(`Question deleted: ${deletedQuestion.question.substring(0, 50)}... (ID: ${questionId})`);
            res.json({ 
                success: true,
                message: 'Question deleted successfully',
                deleted: deletedQuestion 
            });
        } else {
            res.status(404).json({ 
                error: 'Not found',
                message: 'Question not found' 
            });
        }
        
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to delete question' 
        });
    }
});

// ===== SERVE STATIC FILES =====
// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// ===== ERROR HANDLING =====
// Handle 404 - Route not found
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Not found',
        message: 'The requested resource was not found',
        path: req.url 
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong on the server' 
    });
});

// ===== SERVER STARTUP WITH DATABASE INITIALIZATION =====
async function startServer() {
    try {
        console.log('🚀 Initializing E-Learning Server...\n');
        
        // Test database connection
        await testDatabaseConnection();
        
        // Create tables if they don't exist
        await createTables();
        
        // Seed initial data if database is empty
        await seedInitialData();
        
        // Start the server
        app.listen(PORT, () => {
            console.log('\n🎉 E-Learning Server Started Successfully!');
            console.log(`📍 Server running on: http://localhost:${PORT}`);
            console.log(`🗄️  Database: Connected to Railway PostgreSQL`);
            console.log(`🔐 Admin credentials: admin / admin123`);
            console.log('\n📋 Available API Endpoints:');
            console.log('   GET  /api/content        - Retrieve all content from database');
            console.log('   POST /api/login          - Admin authentication');
            console.log('   POST /api/lessons        - Add new lesson to database');
            console.log('   DELETE /api/lessons/:id  - Delete lesson from database');
            console.log('   POST /api/questions      - Add new question to database');
            console.log('   DELETE /api/questions/:id - Delete question from database');
            console.log('\n✅ PostgreSQL Database Integration Complete!');
            console.log('📊 All data is now persisted in your Railway database\n');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await pool.end();
    console.log('✅ Database connections closed');
    process.exit(0);
});