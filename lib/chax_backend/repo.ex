defmodule ChaxBackend.Repo do
  use Ecto.Repo,
    otp_app: :chax_backend,
    adapter: Ecto.Adapters.Postgres
end
