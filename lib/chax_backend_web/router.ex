defmodule ChaxBackendWeb.Router do
  use ChaxBackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", ChaxBackendWeb do
    pipe_through :api
  end
end
