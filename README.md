# Usher

## Getting Started

1. Set up your Supabase Local Instance
   1. `supabase start`
   2. `supabase init`
2. Connect your remote Supabase Database `supabase db remote set postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres`
3. Sync migrations to Supabase directory `yarn migrations:use`
4. Push migrations to the remote database `supabase db push`
5. Copy the `.env.example` to `.env` and apply the environment variables
6. Build the directory `yarn build`

## Database Management

### Pull updates from Remote

```shell
supabase db remote commit
```

### Apply local migrations

```shell
supabase db reset
```

**WARNING:** The diff tool is not foolproof, so you may need to manually rearrange and modify the generated migration.

### Create local migrations

```shell
supabase db commit
```

### Push local migrations

```shell
supabase db push
```
