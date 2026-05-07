// Simple Node.js app
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EKS Production Stack - Almog Tsarfati</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            animation: fadeIn 0.8s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 3em;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(to right, #fff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 20px;
        }

        .author {
            font-size: 1.1em;
            font-weight: 500;
            color: #ffd700;
            margin-top: 10px;
        }

        .description {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .tech-stack {
            margin-top: 30px;
        }

        h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            text-align: center;
        }

        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .tech-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s ease, background 0.3s ease;
        }

        .tech-item:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.2);
        }

        .tech-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            opacity: 0.8;
        }

        .github-link {
            display: inline-block;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 10px;
            margin-top: 20px;
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .github-link:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            h1 { font-size: 2em; }
            .container { padding: 20px; }
            .tech-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>EKS Production Stack</h1>
            <p class="subtitle">Production-Grade Kubernetes Deployment with Full CI/CD Pipeline</p>
            <p class="author">👨‍💻 By Almog Tsarfati</p>
            <span class="status">🟢 Live & Running</span>
        </div>

        <div class="description">
            <p>
                A complete production-ready infrastructure featuring automated deployments,
                observability, and GitOps on AWS EKS. This project demonstrates modern
                DevOps practices with continuous integration, containerization, and
                infrastructure as code.
            </p>
            <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                🤖 Built with <strong>Claude AI</strong> (Anthropic) via <strong>AWS Bedrock</strong>
            </p>
        </div>

        <div class="tech-stack">
            <h2>🛠️ Technology Stack</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-icon">☸️</div>
                    <strong>Kubernetes</strong>
                    <div>AWS EKS</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🐳</div>
                    <strong>Docker</strong>
                    <div>Containerization</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🚀</div>
                    <strong>ArgoCD</strong>
                    <div>GitOps CD</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">⚙️</div>
                    <strong>GitHub Actions</strong>
                    <div>CI Pipeline</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">📊</div>
                    <strong>Grafana</strong>
                    <div>Monitoring</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🏗️</div>
                    <strong>Terraform</strong>
                    <div>Infrastructure as Code</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">📦</div>
                    <strong>Helm</strong>
                    <div>Package Manager</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🟢</div>
                    <strong>Node.js</strong>
                    <div>Application Runtime</div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Deployed via GitHub Actions → Docker Hub → ArgoCD → EKS</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                Infrastructure: AWS EKS | Monitoring: Prometheus + Loki | Logs: Grafana
            </p>
            <a href="https://github.com/almogTsarfati/Claude_Prollecto" target="_blank" class="github-link">
                📂 View on GitHub
            </a>
        </div>
    </div>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});