// HelpView ------------------------------------------------------------------

// Render the specified help file (with Markdown syntax) as HTML.

// DEVELOPER NOTE:  As the use of the "remark-gfm" plugin indicates, we are
// supporting GitHub Flavored Markdown (commonly known as GFM) for the help
// text documents rendered by this view.

// See https://github.github.com/gfm/ for more information.

// External Modules ----------------------------------------------------------

import React, {useEffect, useState} from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ReactHtmlParser from "react-html-parser";
import ReactMarkdown from "react-markdown";
import {useParams} from "react-router-dom";
import remarkGfm from "remark-gfm";

// Internal Modules ----------------------------------------------------------

import logger from "../../util/ClientLogger";
import ReportError from "../../util/ReportError";

// Component Details ---------------------------------------------------------

const HelpView = () => {

    const params: any = useParams();
    const [html, setHtml] = useState<string>("");
    const [markdown, setMarkdown] = useState<string>("");

    useEffect(() => {

        const theUrl = process.env.PUBLIC_URL + `/helptext/${params.resource}`;
        const fetchResource = async () => {
            try {

                const response = await fetch(theUrl);
                const data = await response.text();
                if (params.resource.endsWith(".html")) {
                    setHtml(data);
                    setMarkdown("");
                } else {
                    setHtml("");
                    setMarkdown(data);
                }

                logger.info({
                    context: "HelpView.fetchResource",
                    url: theUrl,
                });

            } catch (error) {
                ReportError("HelpView.fetchResource", error as Error, {
                    url: theUrl,
                    error: error,
                });
            }
        }

        fetchResource();

    }, [params]);

    return (
        <Container fluid id="HelpView">
            <Row className="ml-1 mr-1">
                <Col>
                    {(markdown.length > 0) ? (
                        <ReactMarkdown
                            children={markdown}
                            remarkPlugins={[remarkGfm]}
                            skipHtml={false}
                        />
                    ) : (
                        <>{ReactHtmlParser(html)}</>
                    )}
                </Col>
            </Row>
        </Container>
    )

}

export default HelpView;
