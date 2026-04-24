---

### Estrutura obrigatória do README:

# 🎓 SystemSchool

Descrição do sistema (curta e profissional)

---

## 🚀 Tecnologias Utilizadas
Listar:
React, TypeScript, Vite, Supabase, PostgreSQL, ESLint

---

## 🧠 Arquitetura do Sistema

Mostrar fluxo:

Frontend (React)
↓
Supabase (Auth + Database)
↓
PostgreSQL + RLS

---

## 🔐 Autenticação

Explicar:
- login por email/senha
- controle por role
- sessão persistida

Roles:
- admin
- teacher
- student

---

## 🧩 Estrutura do Projeto

Mostrar estrutura de pastas:

src/
 ├─ components/
 ├─ contexts/
 ├─ hooks/
 ├─ lib/
 │   └─ supabase.ts
 ├─ pages/
 │   ├─ admin/
 │   ├─ teacher/
 │   └─ student/
 ├─ routes/
 ├─ services/
 ├─ types/
 └─ utils/

---

## 📦 Banco de Dados

Informar:
- schema em supabase/schema.sql

Listar principais tabelas:
profiles, students, teachers, classes, subjects, activities, grades, announcements

---

## 🔗 Integração com Supabase

Arquivo:
src/lib/supabase.ts

Explicar `.env`:

VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_key

---

## ⚠️ Segurança

- .env não vai para GitHub
- .env.example é usado como modelo
- RLS ativo no banco

---

## 🛠️ Como Rodar o Projeto

npm install
npm run dev

URL:
http://localhost:5173

---

## 👤 Usuário Admin (Teste)

email: admin@escola.com
senha: 123456

---

## 🧪 Estrutura de Services

Listar:
authService, profileService, studentService, teacherService, classService, activityService, gradeService, announcementService

---

## 🔄 Fluxo de Login

1. login
2. retorno do user
3. busca profile
4. redirecionamento:

admin → /admin
teacher → /teacher
student → /student

---

## 🛡️ Controle de Acesso

- ProtectedRoute
- AuthContext
- RLS

---

## 📊 Funcionalidades

Admin:
- gerenciar alunos, professores, turmas, disciplinas
- criar atividades
- lançar notas
- criar comunicados

Professor:
- visualizar turmas
- criar atividades
- lançar notas
- criar comunicados

Aluno:
- visualizar atividades
- visualizar notas
- visualizar comunicados

---

## 📢 Comunicados

- gerais
- por role
- por turma

---

## 🧮 Sistema de Notas

- por bimestre
- média automática
- status:
  aprovado, recuperação, reprovado

---

## 📈 Futuras Melhorias

- criação automática de usuários via Auth
- upload de arquivos
- dashboard avançado
- relatórios
- SaaS

---

## 💼 Uso Comercial

- sistema escolar
- SaaS educacional
- produto HeinSoft

---

## 🧑‍💻 Desenvolvido por

HeinSoft Company

---
