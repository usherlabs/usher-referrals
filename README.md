# Usher

## Getting Started

1. Set up your Supabase Local Instance
   1. `supabase start`
2. Use migrations `supabase db reset`
3. Push migrations to the remote database `supabase db push`
4. Copy the `.env.example` to `.env` and apply the environment variables
5. Build the directory `yarn build`

## Database Management

**Note:** Supabase `.branches` and `.kong` are created when `supabase start` is executed.

### Connect to Remote Database

```shell
supabase db remote set postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
```

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
