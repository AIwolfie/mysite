import * as THREE from 'three';
import gsap from 'gsap';
import './style.css';

class Experience {
    constructor() {
        this.canvas = document.querySelector('#webgl-canvas');
        this.scene = new THREE.Scene();
        this.currentMode = 'cyber';

        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupNPC();
        this.setupEnvironment();
        this.setupEventListeners();
        this.setupTerminal();
        this.setupContactForm();

        this.progress = 0;
        this.clock = new THREE.Clock();

        this.animate();
        this.initLoader();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
        this.cameraGroup = new THREE.Group();
        this.cameraGroup.add(this.camera);
        this.scene.add(this.cameraGroup);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    setupLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0x00f3ff, 2, 60);
        this.pointLight.position.set(5, 5, 5);
        this.scene.add(this.pointLight);
    }

    setupNPC() {
        const geometry = new THREE.IcosahedronGeometry(1.5, 12);
        this.npcMaterial = new THREE.MeshStandardMaterial({
            color: 0x00f3ff,
            wireframe: true,
            transparent: true,
            opacity: 0.8,
            emissive: 0x00f3ff,
            emissiveIntensity: 3
        });
        this.npc = new THREE.Mesh(geometry, this.npcMaterial);
        this.npc.position.set(6, 4, -5);
        this.scene.add(this.npc);

        const particlesCount = 1500;
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
        const particlesGeometry = new THREE.BufferGeometry();
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.npcParticles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.03, transparent: true, blending: THREE.AdditiveBlending }));
        this.npc.add(this.npcParticles);

        this.binaryGroup = new THREE.Group();
        for (let i = 0; i < 200; i++) {
            const bit = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0 }));
            bit.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
            this.binaryGroup.add(bit);
        }
        this.scene.add(this.binaryGroup);
    }

    setupEnvironment() {
        this.gridHelper = new THREE.GridHelper(100, 50, 0x00f3ff, 0x001111);
        this.gridHelper.position.y = -8;
        this.scene.add(this.gridHelper);

        this.studioGroup = new THREE.Group();
        const studioGeom = new THREE.OctahedronGeometry(2, 0);
        for (let i = 0; i < 25; i++) {
            const mat = new THREE.MeshPhysicalMaterial({ color: 0xff00ff, metalness: 0.9, roughness: 0.1, transmission: 0.9, transparent: true, opacity: 0 });
            const mesh = new THREE.Mesh(studioGeom, mat);
            mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50);
            this.studioGroup.add(mesh);
        }
        this.scene.add(this.studioGroup);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('wheel', (e) => {
            this.progress += e.deltaY * 0.0002;
            this.progress = Math.max(0, Math.min(this.progress, 1));
            this.updateExperience();
        });

        document.getElementById('toggle-cyber').onclick = () => this.switchMode('cyber');
        document.getElementById('toggle-studio').onclick = () => this.switchMode('studio');

        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(this.cameraGroup.rotation, { y: x * 0.1, x: -y * 0.1, duration: 2 });
            gsap.to(this.npc.position, { x: 6 + x * 2, y: 4 - y * 2, duration: 3 });
        });
    }

    updateExperience() {
        const targetZ = 10 - this.progress * 120;
        gsap.to(this.camera.position, { z: targetZ, duration: 1.5, ease: 'power2.out' });

        const layers = ['layer-hero', 'layer-profile', 'layer-skills', 'layer-tools', 'layer-projects', 'layer-achievements', 'layer-contact'];
        const activeIndex = Math.min(Math.floor(this.progress * layers.length), layers.length - 1);

        layers.forEach((id, index) => {
            const el = document.getElementById(id);
            if (index === activeIndex) el.classList.add('active');
            else el.classList.remove('active');
        });

        if (this.progress > 0.02) document.getElementById('scroll-hint').style.opacity = 0;
        else document.getElementById('scroll-hint').style.opacity = 0.5;
    }

    switchMode(mode) {
        if (mode === this.currentMode) return;
        this.currentMode = mode;
        const isCyber = mode === 'cyber';

        document.body.classList.toggle('studio-mode', !isCyber);
        document.getElementById('toggle-cyber').classList.toggle('active', isCyber);
        document.getElementById('toggle-studio').classList.toggle('active', !isCyber);

        document.querySelectorAll('.cyber-only').forEach(el => el.classList.toggle('hidden', !isCyber));
        document.querySelectorAll('.studio-only').forEach(el => el.classList.toggle('hidden', isCyber));

        const color = isCyber ? 0x00f3ff : 0xff00ff;
        gsap.to(this.npcMaterial.color, { r: isCyber ? 0 : 1, g: isCyber ? 0.95 : 0, b: isCyber ? 1 : 1, duration: 1.5 });
        gsap.to(this.pointLight.color, { r: isCyber ? 0 : 1, g: isCyber ? 0.95 : 0, b: isCyber ? 1 : 1, duration: 1.5 });

        gsap.to(this.gridHelper.material, { opacity: isCyber ? 1 : 0, duration: 1 });
        this.studioGroup.children.forEach(m => gsap.to(m.material, { opacity: isCyber ? 0 : 0.8, duration: 1 }));

        this.speak(isCyber ? "Security matrix active. Recon modules online." : "Creative engine initialized. Systems operational.");
        document.getElementById('terminal-wrapper').classList.toggle('hidden', !isCyber);
    }

    speak(text) {
        const el = document.querySelector('.npc-text');
        el.innerHTML = '';
        let i = 0;
        const t = () => { if (i < text.length) { el.innerHTML += text[i++]; setTimeout(t, 25); } };
        t();
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const out = document.getElementById('terminal-output');
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.toLowerCase().trim();
                this.handleCmd(cmd, out);
                input.value = '';
            }
        };
        this.write("WolfShell v3.0 | Status: Connected", out);
    }

    write(text, out) {
        const d = document.createElement('div');
        d.innerHTML = `<span>[wolf@system]</span>: ${text}`;
        out.appendChild(d);
        out.scrollTop = out.scrollHeight;
    }

    handleCmd(cmd, out) {
        this.write(cmd, out);
        if (cmd === 'help') this.write("Commands: status, whoami, skills, clear, secret", out);
        else if (cmd === 'whoami') this.write("AIwolfie - Dual-Identity Architect", out);
        else if (cmd === 'skills') this.write("VULN: XSS, IDOR, SSRF, RCE, RECON, ASYNC_PY", out);
        else if (cmd === 'scan') {
            gsap.to(this.binaryGroup.children.map(b => b.material), { opacity: 0.8, duration: 1, stagger: 0.01 });
            this.speak("Data strings isolated. 0x0101.");
        }
        else if (cmd === 'secret' || cmd === '0101') {
            this.speak("ACCESS GRANTED. Welcome, Operator. Curiosity confirmed.");
            gsap.to(this.camera.position, { z: -180, duration: 3, ease: 'power4.inOut' });
        }
        else if (cmd === 'clear') out.innerHTML = '';
    }

    setupContactForm() {
        const form = document.getElementById('wa-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('wa-name').value;
            const email = document.getElementById('wa-email').value;
            const message = document.getElementById('wa-message').value;

            // Success animation
            const btn = form.querySelector('.submit-btn');
            btn.innerHTML = "INITIALIZATION SUCCESSFUL...";

            setTimeout(() => {
                const text = encodeURIComponent(`Hello AIwolfie, I am interested in your services.\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`);
                window.location.href = `https://wa.me/916352191121?text=${text}`;
            }, 1500);
        };
    }

    initLoader() {
        let p = 0;
        const inv = setInterval(() => {
            p += 4;
            document.querySelector('.progress-bar').style.width = p + '%';
            if (p >= 100) { clearInterval(inv); setTimeout(() => document.getElementById('loader').classList.add('hidden'), 800); }
        }, 40);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getElapsedTime();
        if (this.npc) {
            this.npc.rotation.y += 0.008;
            this.npc.position.y = 4 + Math.sin(delta) * 0.3;
            this.npcParticles.rotation.y += 0.003;
        }
        this.studioGroup.children.forEach((m, i) => { m.rotation.y += 0.02; m.position.y += Math.sin(delta + i) * 0.01; });
        this.renderer.render(this.scene, this.camera);
    }
}
new Experience();
