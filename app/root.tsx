import { json, redirect } from "@remix-run/node";
import { createContact, getContacts } from "./data.server";
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
  useRouteError
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async () => {
  const contacts = await getContacts();
  return json({ contacts });
};

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
  const { contacts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();


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
            <Form id="search-form" role="search">
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={true} />
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
