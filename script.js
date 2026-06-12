document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // MOBILE NAVIGATION MENU
    // ==========================================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (menuClose && mobileMenu) {
        menuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // ==========================================================================
    // NAVBAR SCROLL EFFECT
    // ==========================================================================
    const mainHeader = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // DYNAMIC STAT COUNTER ANIMATION (Intersection Observer)
    // ==========================================================================
    const counters = document.querySelectorAll('.counter');
    const counterSpeed = 200; // The lower, the faster

    const startCounting = (counter, target) => {
        const updateCount = () => {
            const count = +counter.innerText;
            const increment = target / counterSpeed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counterElements = entry.target.querySelectorAll('.counter');
                counterElements.forEach(counter => {
                    // Extract the target value before resetting to 0
                    const target = +counter.innerText;
                    counter.innerText = '0';
                    startCounting(counter, target);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const metricsSection = document.querySelector('.metrics-section');
    if (metricsSection) {
        statsObserver.observe(metricsSection);
    }

    // ==========================================================================
    // SKILLS FILTER SYSTEM
    // ==========================================================================
    const filterTabs = document.querySelectorAll('.filter-tab');
    const skillCards = document.querySelectorAll('.skill-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            skillCards.forEach(card => {
                const cardCat = card.getAttribute('data-cat');
                if (filterValue === 'all' || cardCat === filterValue) {
                    card.classList.remove('hide');
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });

    // ==========================================================================
    // CERTIFICATIONS SHOW MORE TOGGLE
    // ==========================================================================
    const btnToggleCerts = document.getElementById('btn-toggle-certs');
    const hiddenCerts = document.getElementById('hidden-certs');

    if (btnToggleCerts && hiddenCerts) {
        btnToggleCerts.addEventListener('click', () => {
            const isActive = hiddenCerts.classList.toggle('active');
            
            if (isActive) {
                btnToggleCerts.innerHTML = '<i class="fas fa-minus"></i> Ocultar Certificações';
                // Smooth scroll to hidden certs top
                hiddenCerts.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                btnToggleCerts.innerHTML = '<i class="fas fa-plus"></i> Ver Todas as Certificações (Mais 10)';
            }
        });
    }

    // ==========================================================================
    // PORTFOLIO DEMOS MODAL DETAILS INTERACTIVITY
    // ==========================================================================
    const demoModal = document.getElementById('demo-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const btnOpenRealDashboard = document.getElementById('btn-open-real-dashboard');
    const openDemoBtns = document.querySelectorAll('.open-demo-btn');

    // Data for demos — substitua os 'link' pelas URLs reais do Power BI quando disponíveis
    const demosData = {
        'project': {
            title: 'Relatório Demo — Microsoft Project',
            desc: 'Visualização integrada de cronogramas complexos, alocação de recursos humanos, orçamentos previstos versus realizados e taxas de desvio físico/financeiro.',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiYzE2YzgwOGUtMjVlYS00YjE3LWE4NGMtM2Y5YjVjZmQ1MjExIiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9'
        },
        'b2b': {
            title: 'Relatório Demo — Site com conteúdo B2B',
            desc: 'Análise aprofundada de funil de vendas corporativo, taxas de conversão de leads por canal de aquisição, CAC (Custo de Aquisição de Clientes) e LTV (Life Time Value).',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiYjRjODNjMWQtYTUwZC00OTE1LTllMWItMWVkMjUwOTUwOGZhIiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9&embedImagePlaceholder=true'
        },
        'csc': {
            title: 'Relatório Demo — Centro de Serviços Compartilhado (CSC)',
            desc: 'Monitoramento em tempo real de acordos de nível de serviço (SLA), volume de chamados por setor, tempo médio de atendimento (TMA) e índices de satisfação dos usuários.',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiNGIyYTlhZGYtYmY1Ni00OTRiLTkxMDItNmQwYjdhMjFhNmVkIiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9'
        },
        'finance-es': {
            title: 'Relatório Demo — Finanças (Espanhol)',
            desc: 'Painel financeiro internacional projetado em espanhol para análise consolidada de P&L, margens de contribuição, EBITDA e projeções de fluxo de caixa multi-moeda.',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiOTBkYmUyNjgtODM2My00NzBjLWIyY2UtOGRlMjFkYmY1NjUxIiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9'
        },
        'logistics': {
            title: 'Relatório Demo — Logística & Supply Chain',
            desc: 'Otimização de rotas de transporte, tempo médio de entrega (OTIF), custos de frete por transportadora e controle de movimentação e obsolescência de estoques.',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiYzRkZDQ1MjktZWI4ZC00MWQ1LWJiNWQtMGZlYjg2OTNkN2U4IiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9'
        },
        'finance-br': {
            title: 'Relatório Demo — Finanças Geral',
            desc: 'Consolidação contábil corporativa brasileira, demonstrativo de fluxo de caixa direto e indireto, orçamento anual contra despesas reais de departamentos (Budget vs Actual).',
            link: 'https://app.powerbi.com/view?r=eyJrIjoiMTc1ZGMyMTktNWY2MS00NzJkLTkyNGUtYjgwMzIwMDI5N2MwIiwidCI6IjNhN2Y1OGNkLTE0NjktNDZiZS05MTcxLWRkYzhjOTY2ZjliNSJ9'
        }
    };

    openDemoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const demoKey = btn.getAttribute('data-demo');
            const data = demosData[demoKey];

            if (data && demoModal) {
                modalTitle.innerText = data.title;
                modalDesc.innerText = data.desc;

                // Update the link button: show it only if a real URL is set
                if (data.link && data.link.trim() !== '') {
                    btnOpenRealDashboard.setAttribute('href', data.link);
                    btnOpenRealDashboard.style.display = 'inline-flex';
                    btnOpenRealDashboard.onclick = (ev) => {
                        ev.preventDefault();
                        window.open(data.link, '_blank', 'noopener,noreferrer');
                    };
                } else {
                    // No URL yet — show a styled disabled state
                    btnOpenRealDashboard.removeAttribute('href');
                    btnOpenRealDashboard.style.opacity = '0.5';
                    btnOpenRealDashboard.style.cursor = 'not-allowed';
                    btnOpenRealDashboard.innerHTML = '<i class="fas fa-clock"></i> Link em breve';
                    btnOpenRealDashboard.onclick = (ev) => ev.preventDefault();
                }

                // Update mock url bar
                const urlBar = demoModal.querySelector('.mock-url');
                if (urlBar) {
                    urlBar.innerHTML = data.link
                        ? `<i class="fas fa-lock"></i> ${data.link}`
                        : `<i class="fas fa-lock"></i> Link em breve...`;
                }

                // Animate bars inside modal mock for visual engagement
                const bars = demoModal.querySelectorAll('.bar');
                bars.forEach(bar => {
                    const randomHeight = Math.floor(Math.random() * 60) + 30;
                    bar.style.height = `${randomHeight}%`;
                });

                demoModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        if (demoModal) {
            demoModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Enable scrolling
        }
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                closeModal();
            }
        });
    }

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // ==========================================================================
    // CONTACT FORM — Submits data via FormSubmit.co API (reliable email sending)
    // ==========================================================================
    const contactForm = document.getElementById('portfolio-contact-form');
    const successMsg = document.getElementById('form-success-msg');

    if (contactForm && successMsg) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name    = document.getElementById('form-name').value.trim();
            const email   = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            // Use FormSubmit.co AJAX endpoint to send the mail
            fetch("https://formsubmit.co/ajax/kekorolim@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    "Nome": name,
                    "E-mail": email,
                    "Assunto": subject,
                    "Mensagem": message
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Erro no envio do e-mail");
                }
            })
            .then(data => {
                // Show success visual feedback
                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.style.display = 'none';
                    successMsg.classList.add('active');
                    successMsg.style.opacity = '0';
                    setTimeout(() => { successMsg.style.opacity = '1'; }, 50);
                }, 300);
            })
            .catch(error => {
                console.error("FormSubmit Error: ", error);
                alert("Erro ao enviar mensagem. Por favor, envie diretamente para o e-mail: kekorolim@gmail.com");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
        });
    }
});
