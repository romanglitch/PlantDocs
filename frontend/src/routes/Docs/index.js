import React, {useEffect, useState} from 'react';
import { Helmet } from "react-helmet-async";
import {Card, Spin} from 'antd';

import axios from "axios";
import { getToken } from "../../helpers";

import ReactMarkdown from 'react-markdown'
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";


// Styles
import './styles.css'


const Docs = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [docsPage, setDocsPage] = useState([])

    const defaultPageURL = `${process.env.REACT_APP_BACKEND}/api/document`

    useEffect(() => {
        axios({
            method: 'get',
            url: defaultPageURL,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        }).then(function (data) {
            setDocsPage(data.data.data.attributes)
        }).catch(function (error) {
            console.log(error);
        }).finally(function () {
            setIsLoading(false)
        });
    }, [defaultPageURL])

    return (
        <>
            <Helmet>
                <title>{`Документация - PlantDocs`}</title>
            </Helmet>
            <Card className="app-card card-error">
                {isLoading ? (
                    <div className="app-plant-loader">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div>
                        <ReactMarkdown
                            transformImageUri={
                                function (src) {
                                    src = `${process.env.REACT_APP_BACKEND}${src}`
                                    return src
                                }
                            }
                            transformLinkUri={
                                function (href) {
                                    href = `${process.env.REACT_APP_BACKEND}${href}`
                                    return href
                                }
                            }
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            // components={{
                            //     a (props) {
                            //         const {node, href, ...rest} = props
                            //
                            //         // check if a pdf
                            //         if (href.includes('.pdf')) {
                            //             // eslint-disable-next-line
                            //             return <object data={href} type="application/pdf" width="100%" height="100%" />
                            //         }
                            //
                            //         return (
                            //             // eslint-disable-next-line
                            //             <a href={href} {...rest} />
                            //         )
                            //     }
                            // }}
                        >
                            {docsPage.content}
                        </ReactMarkdown>
                    </div>
                )}
            </Card>
        </>
    );
};

export default Docs;
