const AWS = require('aws-sdk');
const ses = new AWS.SES();

exports.createTemplate = async (name, subject, html_body) => {
    const params = {
        Template: {
            TemplateName: name,
            SubjectPart: subject,
            HtmlPart: html_body
        }
    };

    try {
        const result = await ses.createTemplate(params).promise();
        console.log('Template created:', result);
        return {
            failed: false,
            data: result
        };
    } catch (error) {
        console.error('Failed to create template:', error);
        return {
            failed: true,
            error: error
        };
    }
};

exports.getTemplate = async (name) => {
    const params = {
        TemplateName: name
    };
  
    try {
        const result = await ses.getTemplate(params).promise();
        console.log('Template retrieved:', result);
        return {
            failed: false,
            data: result
        };
    } catch (error) {
        console.error('Failed to retrieve template:', error);
        return {
            failed: true,
            error: error
        };
    }
};

exports.listTemplates = async () => {
    const params = {
        MaxItems: 10
    };
  
    try {
        const result = await ses.listTemplates(params).promise();
        console.log('Templates listed:', result.TemplatesMetadata);
        return {
            failed: false,
            data: result
        };
    } catch (error) {
        console.error('Failed to list templates:', error);
        return {
            failed: true,
            error: error
        };
    }
};

exports.deleteTemplate = async (name) => {
    const params = {
        TemplateName: name
    };
  
    try {
        const result = await ses.deleteTemplate(params).promise();
        console.log('Template deleted:', result);
        return {
            failed: false,
            data: result
        };
    } catch (error) {
        console.error('Failed to delete template:', error);
        return {
            failed: true,
            error: error
        };
    }
};

exports.updateTemplate = async (name, subject, html_body) => {
    const params = {
        Template: {
            TemplateName: name,
            SubjectPart: subject,
            HtmlPart: html_body
        }
    };
  
    try {
        const result = await ses.updateTemplate(params).promise();
        console.log('Template updated:', result);
        return {
            failed: false,
            data: result
        };
    } catch (error) {
        console.error('Failed to update template:', error);
        return {
            failed: true,
            error: error
        };
    }
};

