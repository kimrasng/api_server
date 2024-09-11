const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdlp = require('youtube-dl-exec');

const router = express.Router();
const rootPath = path.dirname(require.main.filename);

const downloadDir = path.join(rootPath, 'data', 'ytdl');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

const isValidVideoId = id => /^[a-zA-Z0-9_-]{11}$/.test(id);

router.get('/download', (req, res) => {
    const { file } = req.query;

    if (!file) {
        return res.status(400).json({ code: 400, errorMessage: '파일 이름이 필요합니다.' });
    }

    const filePath = path.join(downloadDir, file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ code: 404, errorMessage: '파일을 찾을 수 없습니다.' });
    }

    res.download(filePath, err => {
        if (err) {
            console.error('Download error:', err);
            res.status(500).json({ code: 500, errorMessage: '파일 다운로드 중 오류 발생.' });
        }
    });
});

router.get('/', (req, res) => {
    const start = Date.now();
    const { id, filetype } = req.query;

    if (!id || !filetype) {
        return res.status(400).json({ code: 400, time: `${Date.now() - start}ms`, errorMessage: '필수 파라미터가 누락되었습니다.' });
    }

    if (filetype !== 'audio' && filetype !== 'video') {
        return res.status(400).json({ code: 400, time: `${Date.now() - start}ms`, errorMessage: 'filetype 파라미터가 올바르지 않습니다.' });
    }

    if (!isValidVideoId(id)) {
        return res.status(400).json({ code: 400, time: `${Date.now() - start}ms`, errorMessage: '유효하지 않은 영상 ID입니다.' });
    }

    const url = `https://youtube.com/watch?v=${id}`;
    const outputFileName = `${id}.${filetype === 'audio' ? 'mp3' : 'mp4'}`;
    const outputPath = path.join(downloadDir, outputFileName);

    if (fs.existsSync(outputPath)) {
        console.log(`[ytdl] ${url} requested as ${filetype}. (cached)`);
        return res.status(200).json({
            code: 200,
            time: `${Date.now() - start}ms`,
            data: { url: `/api/ytdl/download?file=${outputFileName}`, cached: true },
        });
    }

    console.log(`[ytdl] ${url} requested as ${filetype}.`);

    const options = {
        output: path.join(downloadDir, '%(id)s.%(ext)s'),
        noWarnings: true,
        ...(filetype === 'audio' ? {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0,
        } : {
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
        }),
    };

    try {
        const subprocess = ytdlp.exec(url, options);

        let filePath;

        subprocess.stdout.on('data', data => {
            const text = data.toString();
            if (filetype === 'audio') {
                if (text.includes('[ExtractAudio]')) {
                    filePath = text.split(' /').find(line => line.endsWith('mp3')).trim();
                }
            } else if (filetype === 'video') {
                if (text.includes('[Merger]')) {
                    filePath = text.split(' /').find(line => line.endsWith('mp4')).trim();
                }
            }

            if (filePath) {
                const fileName = path.basename(filePath);
                fs.rename(filePath, outputPath, err => {
                    if (err) {
                        console.error('File move error:', err);
                        return res.status(500).json({ code: 500, time: `${Date.now() - start}ms`, errorMessage: '파일 이동 중 오류 발생.' });
                    }
                    console.log(`[ytdl] ${fileName} downloaded successfully.`);
                    res.status(200).json({
                        code: 200,
                        time: `${Date.now() - start}ms`,
                        data: {
                            url: `/api/ytdl/download?file=${fileName}`,
                            cached: false,
                            expiration: `${1000 * 60 * 60 * 2}ms`,
                        },
                    });
                });
            }
        });

        subprocess.stderr.on('data', data => {
            console.error(`stderr: ${data.toString()}`);
        });

        subprocess.on('error', error => {
            console.error('Subprocess error:', error);
            res.status(500).json({ code: 500, time: `${Date.now() - start}ms`, errorMessage: '다운로드 프로세스에서 오류가 발생했습니다.' });
        });

        subprocess.on('exit', code => {
            if (code !== 0) {
                console.error(`Subprocess exited with code ${code}`);
                res.status(500).json({ code: 500, time: `${Date.now() - start}ms`, errorMessage: '다운로드 프로세스가 실패했습니다.' });
            }
        });

    } catch (error) {
        res.status(500).json({ code: 500, time: `${Date.now() - start}ms`, errorMessage: error.message });
    }
});

module.exports = router;
