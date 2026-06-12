import os
import sys
import base64
import json
import urllib.request
import urllib.error
import time

def make_request(url, method, headers, data=None):
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req) as response:
            res_content = response.read()
            if res_content:
                return response.status, json.loads(res_content.decode('utf-8'))
            else:
                return response.status, {}
    except urllib.error.HTTPError as e:
        try:
            err_data = json.loads(e.read().decode('utf-8'))
        except Exception:
            err_data = e.reason
        return e.code, err_data
    except Exception as e:
        return 0, str(e)

def main():
    print("==========================================================")
    print("    PUBLICADOR DE PORTFÓLIO PARA O GITHUB PAGES          ")
    print("==========================================================")
    print("Este script criará um repositório no seu GitHub e fará")
    print("o upload de todos os arquivos de forma 100% automatizada.")
    print()

    # 1. Obter credenciais
    username = input("Digite seu nome de usuário do GitHub: ").strip()
    if not username:
        print("Erro: O nome de usuário é obrigatório.")
        return

    print("\nPara continuar, você precisa de um Token de Acesso Pessoal (PAT) do GitHub.")
    print("Como criar:")
    print("1. Acesse https://github.com/settings/tokens")
    print("2. Clique em 'Generate new token' -> 'Generate new token (classic)'")
    print("3. Defina um nome (ex: 'publicar-portfolio') e marque a opção 'repo'")
    print("4. Clique em 'Generate token' no final da página e copie o código gerado.")
    print()
    token = input("Cole o seu GitHub Personal Access Token (PAT) aqui: ").strip()
    if not token:
        print("Erro: O Token de acesso é obrigatório.")
        return

    repo_name = input("\nNome do repositório [pressione Enter para usar 'portfolio-ricardo']: ").strip()
    if not repo_name:
        repo_name = "portfolio-ricardo"

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Python-Portfolio-Publisher"
    }

    # 2. Validar token e usuário
    print("\n[1/5] Validando credenciais no GitHub...")
    status, user_info = make_request("https://api.github.com/user", "GET", headers)
    if status != 200:
        print(f"Erro ao autenticar: {user_info}")
        print("Por favor, verifique se o seu token está correto e tem as permissões necessárias.")
        return
    
    actual_username = user_info.get("login")
    print(f"Sucesso! Autenticado como {actual_username} ({user_info.get('name')})")

    # 3. Verificar/Criar Repositório
    print(f"\n[2/5] Verificando se o repositório '{repo_name}' já existe...")
    repo_url = f"https://api.github.com/repos/{actual_username}/{repo_name}"
    status, repo_info = make_request(repo_url, "GET", headers)

    if status == 404:
        print(f"Repositório '{repo_name}' não existe. Criando novo repositório público...")
        create_url = "https://api.github.com/user/repos"
        payload = {
            "name": repo_name,
            "description": "Portfólio Profissional de Ricardo Danesi Rolim - Especialista em Data Visualization & Analytics",
            "private": False,
            "has_issues": False,
            "has_projects": False,
            "has_wiki": False
        }
        status, create_info = make_request(create_url, "POST", headers, payload)
        if status not in (200, 201):
            print(f"Erro ao criar repositório: {create_info}")
            return
        print(f"Repositório '{repo_name}' criado com sucesso!")
    elif status == 200:
        print(f"Repositório '{repo_name}' já existe. Os arquivos serão atualizados.")
    else:
        print(f"Erro inesperado ao consultar repositório: {repo_info}")
        return

    # 4. Escanear e preparar arquivos para upload
    print("\n[3/5] Escaneando arquivos locais...")
    files_to_upload = []
    
    # Caminho do diretório atual (onde o script está sendo executado)
    base_dir = os.path.dirname(os.path.abspath(__file__))

    for root, dirs, files in os.walk(base_dir):
        # Ignorar pastas ocultas (como .git) e pastas de mídia temporária
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
        for f in files:
            if f.startswith('.') or f == 'publish_to_github.py' or f.endswith('.py'):
                continue
            
            abs_path = os.path.join(root, f)
            rel_path = os.path.relpath(abs_path, base_dir)
            repo_path = rel_path.replace('\\', '/')
            files_to_upload.append((abs_path, repo_path))

    if not files_to_upload:
        print("Nenhum arquivo de portfólio encontrado para fazer upload!")
        return

    print(f"Encontrados {len(files_to_upload)} arquivos para upload.")

    # 5. Enviar arquivos
    print("\n[4/5] Enviando arquivos para o GitHub...")
    for abs_path, repo_path in files_to_upload:
        print(f" -> Processando: {repo_path}...", end="", flush=True)
        
        try:
            with open(abs_path, "rb") as file_handle:
                content = file_handle.read()
            b64_content = base64.b64encode(content).decode('utf-8')
        except Exception as file_err:
            print(f" Erro ao ler arquivo: {file_err}")
            continue

        # Verificar se o arquivo já existe no repo para obter o SHA (necessário para update)
        contents_url = f"https://api.github.com/repos/{actual_username}/{repo_name}/contents/{repo_path}"
        status, file_info = make_request(contents_url, "GET", headers)
        
        payload = {
            "message": f"Upload automático de {repo_path} pelo script de portfólio",
            "content": b64_content
        }
        
        if status == 200:
            # Arquivo já existe, precisamos passar o SHA do arquivo existente para atualizá-lo
            payload["sha"] = file_info.get("sha")
            # Fazer o PUT para atualizar
            status, upload_info = make_request(contents_url, "PUT", headers, payload)
        elif status == 404:
            # Arquivo novo
            status, upload_info = make_request(contents_url, "PUT", headers, payload)
        else:
            print(f" Erro ao verificar arquivo: {file_info}")
            continue

        if status in (200, 201):
            print(" Enviado!")
        else:
            print(f" Erro no upload: {upload_info}")

    # 6. Habilitar o GitHub Pages
    print("\n[5/5] Configurando o GitHub Pages no repositório...")
    # Aguardar um momento para garantir que os commits foram processados pelo GitHub
    time.sleep(3)
    
    pages_url = f"https://api.github.com/repos/{actual_username}/{repo_name}/pages"
    pages_payload = {
        "source": {
            "branch": "main",
            "path": "/"
        }
    }
    
    # Tenta habilitar o Pages
    status, pages_info = make_request(pages_url, "POST", headers, pages_payload)
    
    if status in (200, 201):
        print("GitHub Pages configurado com sucesso!")
        pages_domain = pages_info.get("html_url")
    elif status == 409:
        # 409 Conflict significa que o Pages já está ativo ou configurado neste repo
        print("GitHub Pages já está configurado neste repositório.")
        pages_domain = f"https://{actual_username}.github.io/{repo_name}/"
    else:
        # Se falhar, pode ser que a branch 'main' ainda não foi processada, tentamos novamente
        print("Aguardando processamento do GitHub para ativar o Pages (mais 5 segundos)...")
        time.sleep(5)
        status, pages_info = make_request(pages_url, "POST", headers, pages_payload)
        if status in (200, 201, 409):
            print("GitHub Pages configurado com sucesso!")
            pages_domain = f"https://{actual_username}.github.io/{repo_name}/"
        else:
            print(f"Nota: Não foi possível ativar o Pages automaticamente ({pages_info}).")
            print("Você pode ativá-lo manualmente acessando o site do GitHub:")
            print(f" -> https://github.com/{actual_username}/{repo_name}/settings/pages")
            pages_domain = f"https://{actual_username}.github.io/{repo_name}/"

    print("\n==========================================================")
    print("                   PORTFÓLIO PUBLICADO!                   ")
    print("==========================================================")
    print(f"Repositório no GitHub: https://github.com/{actual_username}/{repo_name}")
    print(f"Seu site estará disponível em breve no link:")
    print(f" -> {pages_domain}")
    print("==========================================================")
    print("Aguarde de 1 a 2 minutos para o GitHub processar a primeira")
    print("publicação do seu site.")
    print("==========================================================")

if __name__ == "__main__":
    main()
