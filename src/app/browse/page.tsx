import { getSearchParam } from "../../../utils/auth/redirects";
import { BrowseClient } from "./browse-client";

export default async function BrowsePage(props: PageProps<"/browse">) {
  const searchParams = await props.searchParams;
  const showCreatedMessage =
    getSearchParam(searchParams.status) === "listing-created";

  return <BrowseClient showCreatedMessage={showCreatedMessage} />;
}
