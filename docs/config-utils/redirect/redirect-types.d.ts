type RedirectMapping = {
    /**
     * [fromURL]: toURL
     */
    [from: string]: string
}

type DocusaurusRedirect = {
 from: string | string[]
    to: string
}
type GetRedirectsFromMapping = (obj: RedirectMapping) => DocusaurusRedirect