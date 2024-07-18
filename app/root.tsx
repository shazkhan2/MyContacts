import { json, type LoaderFunctionArgs, type LinksFunction, redirect } from "@remix-run/node";
import { createContact, getContacts } from "./data.server";
import { useEffect } from "react";

import {
  Form,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  Link,
  isRouteErrorResponse,
  useRouteError,
  useSubmit,
} from "@remix-run/react";
import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  console.log(contacts)
  return json({ contacts, q });
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body className="root-error">
        <h1>
          Oops, that didnt work
        </h1>
        <p>
          {isRouteErrorResponse(error)
          ?`${error.status} ${error.statusText}`
          : error instanceof Error
          ? error.message
          :"Unknown Error" }
        </p>

        <Scripts />
      </body>
    </html>
  );
}




export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const searching = navigation.location && new URLSearchParams(
    navigation.location.search
  ).has("q");
  const submit = useSubmit();
  useEffect( () => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value= q || ""
    }
  }, [q])



  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div id="top">

            <Form id="search-form" role="search" 
            onChange={(event) => {
              const isFirstSearch = q === null;
             submit(event.currentTarget, {
              replace: !isFirstSearch,
             });
            }}
            >
            
              <input
                id="q"
                className={searching ? "loading" : "" }
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q || ""}
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Link to="contacts/create" className="buttonLink">Create</Link>
          </div>
          <nav>
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                   <NavLink
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "active"
                      : isPending
                      ? "pending"
                      : ""
                  }
                  to={`contacts/${contact.id}`}
                >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite ? (
                      <span>{`\u2605`} </span>
                    ) : null}
                  </NavLink>
                </li>
              ))}
              {contacts.length === 0 && (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            </ul>
          </nav>
        </div>
        <div 
          className={
            navigation.state === "loading" ? "loading" : ""
          }
        id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
